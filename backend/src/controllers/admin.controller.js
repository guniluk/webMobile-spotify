import { Song } from '../models/song.model.js';
import { Album } from '../models/album.model.js';
import cloudinary from '../lib/cloudinary.js';
import fs from 'fs';

// helper function for cloudinary upload
const uploadToCloudinary = async (file) => {
  try {
    const result = await cloudinary.uploader.upload(file.tempFilePath, {
      resource_type: 'auto',
      folder: 'songs',
    });
    return result.secure_url;
  } catch (error) {
    console.log('Error uploading to cloudinary:', error);
    throw new Error('Error uploading to cloudinary');
  } finally {
    // 성공/실패 여부와 관계없이 로컬 임시 파일 제거
    if (file && file.tempFilePath) {
      fs.unlink(file.tempFilePath, (err) => {
        if (err) console.error("Error deleting temp file:", err);
      });
    }
  }
};

export const createSong = async (req, res, next) => {
  try {
    if (!req.files || !req.files.audioFile || !req.files.imageFile) {
      return res
        .status(400)
        .json({ message: 'Please upload an audio file and an image file.' });
    }

    const { title, artist, albumId, duration } = req.body;
    const audioFile = req.files.audioFile;
    const imageFile = req.files.imageFile;

    // send to cloudinay and get url
    const audioUrl = await uploadToCloudinary(audioFile);
    const imageUrl = await uploadToCloudinary(imageFile);

    // handle cloudniary upload failure
    if (!audioUrl || !imageUrl) {
      return res
        .status(400)
        .json({ message: 'Failed to upload files to cloudinary' });
    }

    const song = new Song({
      title,
      artist,
      albumId: albumId || null,
      duration,
      audioUrl,
      imageUrl,
    });
    await song.save();
    if (albumId) {
      await Album.findByIdAndUpdate(albumId, {
        $push: { songs: song._id },
      });
    }
    res.status(201).json(song);
  } catch (error) {
    console.log('song creation error', error);
    next(error);
  }
};

export const deleteSong = async (req, res, next) => {
  try {
    const { songId } = req.params;
    const song = await Song.findById(songId);
    if (!song) {
      return res.status(404).json({ message: 'Song not found' });
    }
    if (song.albumId) {
      await Album.findByIdAndUpdate(song.albumId, {
        $pull: { songs: songId },
      });
    }
    await Song.findByIdAndDelete(songId);
    res.status(200).json({ message: 'Song deleted successfully' });
  } catch (error) {
    console.log('song deletion error', error);
    next(error);
  }
};

export const createAlbum = async (req, res, next) => {
  try {
    const { title, artist, releaseYear } = req.body;
    if (!req.files || !req.files.imageFile) {
      return res.status(400).json({ message: 'Please upload an image file.' });
    }
    const imageFile = req.files.imageFile;
    const imageUrl = await uploadToCloudinary(imageFile);
    if (!imageUrl) {
      return res
        .status(400)
        .json({ message: 'Failed to upload image to cloudinary' });
    }
    const album = new Album({
      title,
      artist,
      releaseYear,
      imageUrl,
    });
    await album.save();
    res.status(201).json(album);
  } catch (error) {
    console.log('album creation error', error);
    next(error);
  }
};

export const deleteAlbum = async (req, res, next) => {
  try {
    const { albumId } = req.params;
    const album = await Album.findById(albumId);
    if (!album) {
      return res.status(404).json({ message: 'Album not found' });
    }
    // first, delete songs in album
    if (album.songs.length > 0) {
      await Song.deleteMany({ _id: { $in: album.songs } });
    }
    // then, delete album
    await Album.findByIdAndDelete(albumId);
    res.status(200).json({ message: 'Album deleted successfully' });
  } catch (error) {
    console.log('album deletion error', error);
    next(error);
  }
};

export const checkAdmin = (req, res, next) => {
  res.status(200).json({ admin: true });
};
