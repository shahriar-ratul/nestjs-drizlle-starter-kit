import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
  SetMetadata,
  Query,
  Put,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { AdminsService } from '../services/admins.service';

import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { CreateAdminDto } from '../dto/create-admin.dto';
import { UpdateAdminDto } from '../dto/update-admin.dto';

import { AbilityGuard } from '@/modules/auth/ability/ability.guard';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard';
import { FileInterceptor } from '@nestjs/platform-express';

import { diskStorage } from 'multer';
import * as fs from 'fs';
import * as path from 'path';
import { Public } from '@/core/decorator/public.decorator';
import { AdminPageOptionsDto } from '@/core/dto/admin-page-option.dto';
import { Admin } from '@/modules/drizzle/schema/admin-module.schema';

export const storageAdmin = {
  storage: diskStorage({
    destination: './public/uploads/admins',
    filename: (req, file, cb) => {
      const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
      const extension: string = path.extname(file.originalname);
      const filename = `${uniqueSuffix}${extension}`;
      // const filename: string = `${uniqueSuffix}${extension}`;
      cb(null, filename);
    },
  }),
};

const deleteFile = (path: string) => {
  fs.unlink(path, (err) => {
    if (err) {
      console.error(err);
      return;
    }
  });
};

@ApiTags('admins')
@Controller({ version: '1', path: 'admins' })
@UseGuards(JwtAuthGuard)
@UseGuards(AbilityGuard)
export class AdminsController {
  constructor(private readonly _adminsService: AdminsService) {}

  @Public()
  @Get()
  @ApiResponse({
    status: 200,
    description: 'List all admins',
  })
  @SetMetadata('permissions', ['admin.view'])
  async findAll(@Query() pageOptionsDto: AdminPageOptionsDto) {
    return await this._adminsService.findAll(pageOptionsDto);
  }

  @Post()
  @ApiResponse({
    status: 200,
    description: 'The record has been successfully created.',
  })
  @SetMetadata('permissions', ['admin.create'])
  @UseInterceptors(FileInterceptor('image', storageAdmin))
  async create(
    @UploadedFile()
    image: Express.Multer.File,
    @Body() createAdminDto: CreateAdminDto,
  ) {
    // if (!image) {
    //   throw new UnprocessableEntityException('Image is required');
    // }

    return this._adminsService.create(createAdminDto, image);
  }

  @Get(':id')
  @ApiResponse({})
  @SetMetadata('permissions', ['admin.view'])
  async findOne(@Param('id') id: number) {
    return this._adminsService.findById(+id);
  }

  @Put(':id')
  @ApiResponse({})
  @SetMetadata('permissions', ['admin.update'])
  @UseInterceptors(FileInterceptor('image', storageAdmin))
  async update(
    @Param('id') id: number,
    @UploadedFile()
    image: Express.Multer.File,
    @Body() updateAdminDto: UpdateAdminDto,
  ) {
    return this._adminsService.update(+id, updateAdminDto, image);
  }

  @Delete(':id')
  @ApiResponse({})
  @SetMetadata('permissions', ['admin.delete'])
  async remove(@Param('id') id: number) {
    // soft delete
    // return this._adminsService.remove(id);
    return this._adminsService.delete(id);
  }

  @Post(':id/status')
  @ApiResponse({})
  @SetMetadata('permissions', ['admin.status'])
  async changeStatus(@Param('id') id: number) {
    return this._adminsService.changeStatus(+id);
  }
}
