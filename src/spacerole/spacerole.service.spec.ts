import { Test, TestingModule } from '@nestjs/testing';
import { SpaceroleService } from './spacerole.service';

describe('SpaceroleService', () => {
  let service: SpaceroleService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SpaceroleService],
    }).compile();

    service = module.get<SpaceroleService>(SpaceroleService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
