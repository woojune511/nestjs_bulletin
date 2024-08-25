import { Test, TestingModule } from '@nestjs/testing';
import { UserspaceController } from './userspace.controller';
import { UserspaceService } from './userspace.service';

describe('UserspaceController', () => {
  let controller: UserspaceController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserspaceController],
      providers: [UserspaceService],
    }).compile();

    controller = module.get<UserspaceController>(UserspaceController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
