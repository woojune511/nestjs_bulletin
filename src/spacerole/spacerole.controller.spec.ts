import { Test, TestingModule } from '@nestjs/testing';
import { SpaceroleController } from './spacerole.controller';
import { SpaceroleService } from './spacerole.service';

describe('SpaceroleController', () => {
  let controller: SpaceroleController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SpaceroleController],
      providers: [SpaceroleService],
    }).compile();

    controller = module.get<SpaceroleController>(SpaceroleController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
