import { Test, TestingModule } from '@nestjs/testing';
import { UserspaceService } from './userspace.service';

describe('UserspaceService', () => {
  let service: UserspaceService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UserspaceService],
    }).compile();

    service = module.get<UserspaceService>(UserspaceService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
