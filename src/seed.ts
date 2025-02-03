// /**
//  * @description Populate the database with initial code blocks.
//  * to run the function without running the entire server run the command 
//  */

// import { NestFactory } from '@nestjs/core';
// import { AppModule } from './app.module';
// import { CodeBlockService } from './code-block/code-block.service';

// async function bootstrap() {
//   const app = await NestFactory.createApplicationContext(AppModule);
//   const codeBlockService = app.get(CodeBlockService);

//   const codeBlocks = [
//     {
//       title: 'Async Case',
//       code: 'async function fetchData() {\n  // Your code here\n}',
//       solution: 'async function fetchData() {\n  return await fetch("/data");\n}',
//     },
//     {
//       title: 'Promise Example',
//       code: 'function fetchData() {\n  // Your code here\n}',
//       solution: 'function fetchData() {\n  return new Promise((resolve) => resolve("data"));\n}',
//     },
//     {
//       title: 'Simple Loop',
//       code: 'for (let i = 0; i < 5; i++) {\n  // Your code here\n}',
//       solution: 'for (let i = 0; i < 5; i++) {\n  console.log(i);\n}',
//     },
//     {
//       title: 'Array Map Example',
//       code: 'const numbers = [1, 2, 3, 4, 5];\nconst doubledNumbers = numbers.map(num => {\n  // Your code here\n});',
//       solution: 'const numbers = [1, 2, 3, 4, 5];\nconst doubledNumbers = numbers.map(num => num * 2);',
//     },
//   ];
  

//   await codeBlockService['codeBlockModel'].insertMany(codeBlocks);
//   console.log('Database seeded!');
//   await app.close();
// }

// bootstrap();