import Queue from 'bull';
import dbClient from './utils/db';
import { createReadStream, writeFile } from 'fs';
import imageThumbnail from 'image-thumbnail';

const fileQueue = new Queue('fileQueue');

fileQueue.process(async (job, done) => {
  if (!job.data.userId) {
    done(new Error('Missing userId'));
  }
  if (!job.data.fileId) {
    done(new Error('Missing fileId'));
  }

  job.progress(0);
  // checking document based on the fileId and the userId
  const result = await dbClient.findFile(job.data.fileId);
  if (!result) {
    done(new Error('File not found'));
  }
  job.progress(20);

  //   check if the userId is equal to the owner of the fle.
  if (job.data.userId !== result.userId.toString()) {
    done(new Error('File not found'));
  }
  job.progress(25);

  //   retrieve the contents of the file
  try {
    const stream = createReadStream(result.localPath);
    const thumbnail100 = await imageThumbnail(stream, {
      width: 100,
    });

    const stream1 = createReadStream(result.localPath);
    const thumbnail500 = await imageThumbnail(stream1, {
      width: 500,
    });

    const stream2 = createReadStream(result.localPath);
    const thumbnail250 = await imageThumbnail(stream2, {
      width: 250,
    });
    job.progress(50);

    const rootPath = result.localPath.trim(result._id.toString());

    // saving the thumbnails to file
    const absolutePath = rootPath + '100';
    writeFile(absolutePath, thumbnail100, (err) => {
      if (err) {
        console.log(err.toString());
      }
    });
    job.progress(60);

    // saving the thumbnails to file
    const absolutePath2 = rootPath + '250';
    writeFile(absolutePath2, thumbnail250, (err) => {
      if (err) {
        console.log(err.toString());
      }
    });
    job.progress(70);

    // saving the thumbnails to file
    const absolutePath3 = rootPath + '500';
    writeFile(absolutePath3, thumbnail500, (err) => {
      if (err) {
        console.log(err.toString());
      }
    });
    job.progress(100);

    // complete the job
    done();
  } catch (e) {
    console.log(e.toString());
  }
});

fileQueue.on('completed', (job) => {
  console.log(`Job ${job.id} completed!:`);
});

fileQueue.on('failed', (job, err) => {
  console.error(`Job ${job.id} failed! Error:`, err);
});

fileQueue.on('progress', (job, progress) => {
  console.log(`Job ${job.id} progress:`, progress);
});

export default fileQueue;
