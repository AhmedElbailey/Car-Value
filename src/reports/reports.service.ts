import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Report } from './report.entity';
import { CreateReportDto } from './dtos/create-report.dto';
import { User } from '../users/user.entity';
import { GetEstimateDto } from './dtos/get-estimate.dto';

@Injectable()
export class ReportsService {
  constructor(@InjectRepository(Report) private repo: Repository<Report>) {}

  create(reportDto: CreateReportDto, user: User) {
    const report = this.repo.create(reportDto);
    report.user = user;
    return this.repo.save(report);
  }

  async changeApproval(id: number, approved: boolean) {
    const report = await this.repo.findOne({ where: { id: id } });
    if (!report) {
      throw new NotFoundException('Report not found');
    }
    report.approved = approved;
    return this.repo.save(report);
  }

  async getEstimate(data: GetEstimateDto) {
    return (
      this.repo
        .createQueryBuilder()
        // .select('AVG(price)', 'price')
        .select('*')
        .where('make = :make', { make: data.make })
        .andWhere('lat - :lat BETWEEN -5 AND 5', { lat: data.lat })
        .andWhere('lng - :lng BETWEEN -5 AND 5', { lng: data.lng })
        .andWhere('year - :year BETWEEN -5 AND 5', { year: data.year })
        // .andWhere('approved IS TRUE')
        .orderBy('ABS(mileage - :mileage)', 'ASC')
        .setParameters({ milage: data.mileage })
        .limit(8)
        .getRawMany()
    );
  }
}
