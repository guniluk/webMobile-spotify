import { Album } from '../models/album.model.js';

// from album db, get all album list
export const getAllAlbums = async (req, res, next) => {
  try {
    const albums = await Album.find().sort({ createdAt: -1 });
    res.status(200).json(albums);
  } catch (error) {
    console.log('get all album error', error);
    next(error);
  }
};

// get album by id
export const getAlbumById = async (req, res, next) => {
  try {
    const { albumId } = req.params;
    const album = await Album.findById(albumId).populate('songs');
    if (!album) {
      return res.status(404).json({ message: 'Album not found' });
    }
    res.status(200).json(album);
  } catch (error) {
    console.log('get album by id error', error);
    next(error);
  }
};
