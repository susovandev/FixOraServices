import fs from 'node:fs/promises';

import Logger from '@config/logger.config.js';
import { uploadOnCloudinary } from '@utils/cloudinary.js';
import type { Request, Response } from 'express';
import techniciansModel from 'models/technicians.model.js';
import technicianVerificationModel, {
  KycDocumentStatus,
} from 'models/technician-verification.model.js';
class TechnicianAuthController {
  async getRegisterPage(req: Request, res: Response) {
    return res.render('pages/technician/register', { title: 'Technician Registration' });
  }

  async getKycPage(req: Request, res: Response) {
    return res.render('pages/technician/kyc', { title: 'Technician KYC' });
  }

  async registerHandler(req: Request, res: Response) {
    const { name, phone, email, serviceRadiusKm, longitude, latitude } = req.body;
    const profileImageLocalFilePath = req?.file?.path;
    try {
      Logger.info(`Register request received with body: ${JSON.stringify(req.body)}`);

      if (!profileImageLocalFilePath) {
        throw new Error('Profile image is required');
      }

      const cloudinaryResponse = await uploadOnCloudinary({
        localFilePath: profileImageLocalFilePath,
      });

      if (!cloudinaryResponse) {
        throw new Error('Failed to upload profile image on cloudinary');
      }

      const existingTechnician = await techniciansModel.findOne({
        phone,
      });

      if (existingTechnician) {
        throw new Error('Technician already exists');
      }

      const newTechnicianRecord = await techniciansModel.create({
        name,
        phone,
        email,
        location: {
          type: 'Point',
          coordinates: [longitude, latitude],
        },
        serviceRadiusKm,
        profileImage: {
          publicId: cloudinaryResponse.public_id,
          url: cloudinaryResponse.secure_url,
        },
      });

      console.log(newTechnicianRecord);

      req.session.technicianId = newTechnicianRecord._id;

      // TODO: SEND NOTIFICATION TO THE ADMIN THAT A NEW TECHNICIAN IS REGISTERED

      req.flash(
        'success',
        'You successfully applied for Technician registration please fill your KYC details'
      );
      return res.redirect('/technicians/kyc');
    } catch (error) {
      Logger.error(`Error in registerHandler: ${error}`);
      req.flash('error', `${(error as Error).message}`);
      return res.redirect('/technicians/register');
    } finally {
      if (profileImageLocalFilePath) {
        await fs.unlink(profileImageLocalFilePath);
      }
    }
  }

  async submitKycHandler(req: Request, res: Response) {
    const { idType, idNumber } = req.body;
    const kycDocumentLocalFilePath = req?.file?.path;
    try {
      Logger.info(`KYC request received with body: ${JSON.stringify(req.body)}`);

      if (!kycDocumentLocalFilePath) {
        throw new Error('KYC document is required');
      }

      const cloudinaryResponse = await uploadOnCloudinary({
        localFilePath: kycDocumentLocalFilePath,
      });

      if (!cloudinaryResponse) {
        throw new Error('Failed to upload KYC document on cloudinary');
      }

      const kycRecord = await technicianVerificationModel.findOneAndUpdate(
        {
          technicianId: req.session?.technicianId,
        },
        {
          $set: {
            kyc: {
              idType,
              idNumber,
              documents: [
                {
                  type: idType,
                  fileUrl: {
                    publicId: cloudinaryResponse.public_id,
                    url: cloudinaryResponse.secure_url,
                  },
                  status: KycDocumentStatus.PENDING,
                },
              ],
              verified: false,
            },
          },
        },
        {
          upsert: true,
          new: true,
          runValidators: true,
        }
      );

      console.log(kycRecord);

      if (!kycRecord) {
        throw new Error('Failed to create kyc record');
      }

      req.flash('success', 'Your KYC has been submitted successfully, please wait for approval');
      res.redirect('/technicians/dashboard');
    } catch (error) {
      Logger.error(`Error in submitKycHandler: ${error}`);
      req.flash('error', `${(error as Error).message}`);
      return res.redirect('/technicians/kyc');
    } finally {
      if (kycDocumentLocalFilePath) {
        await fs.unlink(kycDocumentLocalFilePath);
      }
    }
  }
}
export default new TechnicianAuthController();
