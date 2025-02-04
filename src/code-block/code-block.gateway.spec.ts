import { Test, TestingModule } from '@nestjs/testing';
import { CodeBlockGateway } from './code-block.gateway';

describe('CodeBlockGateway', () => {
  let gateway: CodeBlockGateway;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CodeBlockGateway],
    }).compile();

    gateway = module.get<CodeBlockGateway>(CodeBlockGateway);
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });
});
