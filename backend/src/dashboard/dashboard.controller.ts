import { Controller, Get } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import type { ResumenDashboard } from './dashboard.types';

@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get()
  obtenerResumen(): Promise<ResumenDashboard> {
    return this.dashboardService.obtenerResumen();
  }
}
