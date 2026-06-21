import { Song } from '../models/song.model.js';

// get all song list
export const getAllSongs = async (req, res, next) => {
  try {
    const songs = await Song.find().sort({ createdAt: -1 });
    res.status(200).json(songs);
  } catch (error) {
    console.log('get all songs error', error);
    next(error);
  }
};

// at song list, randomly show 6 songs
export const getFeaturedSongs = async (req, res, next) => {
  try {
    const songs = await Song.aggregate([
      { $sample: { size: 6 } },
      {
        $project: { _id: 1, title: 1, artist: 1, imageUrl: 1, audioUrl: 1 },
      },
    ]);
    res.status(200).json(songs);
  } catch (error) {
    console.log('get featured songs error', error);
    next(error);
  }
};

export const getMadeForYouSongs = async (req, res, next) => {
  try {
    const songs = await Song.aggregate([
      { $sample: { size: 4 } },
      {
        $project: { _id: 1, title: 1, artist: 1, imageUrl: 1, audioUrl: 1 },
      },
    ]);
    res.status(200).json(songs);
  } catch (error) {
    console.log('get made for you songs error', error);
    next(error);
  }
};

export const getTrendingSongs = async (req, res, next) => {
  try {
    const songs = await Song.aggregate([
      { $sample: { size: 4 } },
      {
        $project: { _id: 1, title: 1, artist: 1, imageUrl: 1, audioUrl: 1 },
      },
    ]);
    res.status(200).json(songs);
  } catch (error) {
    console.log('get trending songs error', error);
    next(error);
  }
};
