import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { Song } from '../models/song.model.js';
import { Album } from '../models/album.model.js';

// Resolve __dirname in ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from backend/.env
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  console.error('Error: MONGO_URI is missing from environment variables.');
  process.exit(1);
}

const seedDatabase = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGO_URI);
    console.log('MongoDB Connected successfully for seeding.');

    // Clear existing data
    await Song.deleteMany({});
    await Album.deleteMany({});
    console.log('Cleared existing Songs and Albums data from database.');

    // Define 4 albums
    const albumsData = [
      {
        title: 'Vaporwave Nights',
        artist: 'Neo-Tokyo',
        imageUrl: 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?q=80&w=400&auto=format&fit=crop',
        releaseYear: 2024,
      },
      {
        title: 'Midnight Melancholy',
        artist: 'The Raindrops',
        imageUrl: 'https://images.unsplash.com/photo-1515462277126-270d878326e5?q=80&w=400&auto=format&fit=crop',
        releaseYear: 2023,
      },
      {
        title: 'Acoustic Campfire',
        artist: 'Forest Wanderer',
        imageUrl: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?q=80&w=400&auto=format&fit=crop',
        releaseYear: 2022,
      },
      {
        title: 'Cyberpunk Drive',
        artist: 'Ghost In The Shell',
        imageUrl: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=400&auto=format&fit=crop',
        releaseYear: 2024,
      },
    ];

    // Insert albums first
    const createdAlbums = await Album.insertMany(albumsData);
    console.log(`Created ${createdAlbums.length} albums.`);

    // Extract created album references
    const [vaporwaveAlbum, rainAlbum, acousticAlbum, cyberAlbum] = createdAlbums;

    // Define 20 songs (16 associated with the 4 albums, 4 singles without albums)
    const songsData = [
      // --- Vaporwave Nights Album Songs ---
      {
        title: 'Neon Horizon',
        artist: 'Neo-Tokyo',
        imageUrl: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?q=80&w=400&auto=format&fit=crop',
        audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
        duration: 372,
        albumId: vaporwaveAlbum._id,
      },
      {
        title: 'Retro Glow',
        artist: 'Neo-Tokyo',
        imageUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=400&auto=format&fit=crop',
        audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
        duration: 425,
        albumId: vaporwaveAlbum._id,
      },
      {
        title: 'Synthetic Dream',
        artist: 'Neo-Tokyo',
        imageUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=400&auto=format&fit=crop',
        audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
        duration: 344,
        albumId: vaporwaveAlbum._id,
      },
      {
        title: 'City Lights',
        artist: 'Neo-Tokyo',
        imageUrl: 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?q=80&w=400&auto=format&fit=crop',
        audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3',
        duration: 302,
        albumId: vaporwaveAlbum._id,
      },

      // --- Midnight Melancholy Album Songs ---
      {
        title: 'Rainy Evening',
        artist: 'The Raindrops',
        imageUrl: 'https://images.unsplash.com/photo-1534274988757-a28bf1a57c17?q=80&w=400&auto=format&fit=crop',
        audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3',
        duration: 363,
        albumId: rainAlbum._id,
      },
      {
        title: 'Lost in Thoughts',
        artist: 'The Raindrops',
        imageUrl: 'https://images.unsplash.com/photo-1487180142328-0c4e37023af5?q=80&w=400&auto=format&fit=crop',
        audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3',
        duration: 355,
        albumId: rainAlbum._id,
      },
      {
        title: 'Whispers in the Dark',
        artist: 'The Raindrops',
        imageUrl: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?q=80&w=400&auto=format&fit=crop',
        audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3',
        duration: 455,
        albumId: rainAlbum._id,
      },
      {
        title: 'Shadows',
        artist: 'The Raindrops',
        imageUrl: 'https://images.unsplash.com/photo-1518241353330-0f7941c2d9b5?q=80&w=400&auto=format&fit=crop',
        audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3',
        duration: 338,
        albumId: rainAlbum._id,
      },

      // --- Acoustic Campfire Album Songs ---
      {
        title: 'Woodland Path',
        artist: 'Forest Wanderer',
        imageUrl: 'https://images.unsplash.com/photo-1448375240586-882707db888b?q=80&w=400&auto=format&fit=crop',
        audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-9.mp3',
        duration: 400,
        albumId: acousticAlbum._id,
      },
      {
        title: 'Warm Hearth',
        artist: 'Forest Wanderer',
        imageUrl: 'https://images.unsplash.com/photo-1542224566-6e85f2e6772f?q=80&w=400&auto=format&fit=crop',
        audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-10.mp3',
        duration: 528,
        albumId: acousticAlbum._id,
      },
      {
        title: 'Starlit Sky',
        artist: 'Forest Wanderer',
        imageUrl: 'https://images.unsplash.com/photo-1506318137071-a8e063b4bec0?q=80&w=400&auto=format&fit=crop',
        audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-11.mp3',
        duration: 412,
        albumId: acousticAlbum._id,
      },
      {
        title: 'Morning Dew',
        artist: 'Forest Wanderer',
        imageUrl: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?q=80&w=400&auto=format&fit=crop',
        audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-12.mp3',
        duration: 468,
        albumId: acousticAlbum._id,
      },

      // --- Cyberpunk Drive Album Songs ---
      {
        title: 'Glitch in the Matrix',
        artist: 'Ghost In The Shell',
        imageUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=400&auto=format&fit=crop',
        audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-13.mp3',
        duration: 368,
        albumId: cyberAlbum._id,
      },
      {
        title: 'Digital Overload',
        artist: 'Ghost In The Shell',
        imageUrl: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=400&auto=format&fit=crop',
        audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-14.mp3',
        duration: 444,
        albumId: cyberAlbum._id,
      },
      {
        title: 'Hacker Mind',
        artist: 'Ghost In The Shell',
        imageUrl: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?q=80&w=400&auto=format&fit=crop',
        audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-15.mp3',
        duration: 395,
        albumId: cyberAlbum._id,
      },
      {
        title: 'Netrunner',
        artist: 'Ghost In The Shell',
        imageUrl: 'https://images.unsplash.com/photo-1563089145-599997674d42?q=80&w=400&auto=format&fit=crop',
        audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-16.mp3',
        duration: 431,
        albumId: cyberAlbum._id,
      },

      // --- Singles (No Album) ---
      {
        title: 'Summer Breeze',
        artist: 'Solar Flare',
        imageUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=400&auto=format&fit=crop',
        audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
        duration: 372,
      },
      {
        title: 'Chill Out',
        artist: 'Lofi Generator',
        imageUrl: 'https://images.unsplash.com/photo-1518173946687-a4c8a383392e?q=80&w=400&auto=format&fit=crop',
        audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
        duration: 425,
      },
      {
        title: 'Golden Hour',
        artist: 'Acoustic Vibes',
        imageUrl: 'https://images.unsplash.com/photo-1470252649378-9c29740c9fa8?q=80&w=400&auto=format&fit=crop',
        audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
        duration: 344,
      },
      {
        title: 'Night Ride',
        artist: 'Synthwave Rider',
        imageUrl: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=400&auto=format&fit=crop',
        audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3',
        duration: 302,
      },
    ];

    // Insert songs
    const createdSongs = await Song.insertMany(songsData);
    console.log(`Created ${createdSongs.length} songs.`);

    // Map inserted songs back to their respective albums' "songs" arrays
    for (const album of createdAlbums) {
      const albumSongs = createdSongs.filter(
        (song) => song.albumId && song.albumId.toString() === album._id.toString()
      );
      album.songs = albumSongs.map((song) => song._id);
      await album.save();
    }
    console.log('Successfully updated Album documents with their respective song IDs.');
    console.log('Database seeding completed successfully!');
  } catch (error) {
    console.error('Error during seeding:', error);
  } finally {
    await mongoose.connection.close();
    console.log('MongoDB connection closed.');
    process.exit(0);
  }
};

seedDatabase();
