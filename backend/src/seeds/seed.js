import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { Song } from "../models/song.model.js";
import { Album } from "../models/album.model.js";

// Resolve __dirname in ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from backend/.env
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  console.error("Error: MONGO_URI is missing from environment variables.");
  process.exit(1);
}

const seedDatabase = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGO_URI);
    console.log("MongoDB Connected successfully for seeding.");

    // Clear existing data
    await Song.deleteMany({});
    await Album.deleteMany({});
    console.log("Cleared existing Songs and Albums data from database.");

    // Define 8 albums
    const albumsData = [
      {
        title: "Vaporwave Nights",
        artist: "Neo-Tokyo",
        imageUrl:
          "https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?q=80&w=400&auto=format&fit=crop",
        releaseYear: 2024,
      },
      {
        title: "Midnight Melancholy",
        artist: "The Raindrops",
        imageUrl:
          "https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?q=80&w=400&auto=format&fit=crop",
        releaseYear: 2023,
      },
      {
        title: "Acoustic Campfire",
        artist: "Forest Wanderer",
        imageUrl:
          "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?q=80&w=400&auto=format&fit=crop",
        releaseYear: 2022,
      },
      {
        title: "Cyberpunk Drive",
        artist: "Ghost In The Shell",
        imageUrl:
          "https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=400&auto=format&fit=crop",
        releaseYear: 2024,
      },
      {
        title: "Lofi Study Session",
        artist: "Lofi Girl",
        imageUrl:
          "https://images.unsplash.com/photo-1518609878373-06d740f60d8b?q=80&w=400&auto=format&fit=crop",
        releaseYear: 2023,
      },
      {
        title: "Neon Dreamscape",
        artist: "Synthwave Kid",
        imageUrl:
          "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?q=80&w=400&auto=format&fit=crop",
        releaseYear: 2024,
      },
      {
        title: "Golden Forest",
        artist: "Acoustic Vibes",
        imageUrl:
          "https://images.unsplash.com/photo-1448375240586-882707db888b?q=80&w=400&auto=format&fit=crop",
        releaseYear: 2022,
      },
      {
        title: "Digital Revolution",
        artist: "Hacker Club",
        imageUrl:
          "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?q=80&w=400&auto=format&fit=crop",
        releaseYear: 2024,
      },
    ];

    // Insert albums first
    const createdAlbums = await Album.insertMany(albumsData);
    console.log(`Created ${createdAlbums.length} albums.`);

    const albumTracksInfo = [
      // Vaporwave Nights
      [
        { title: "Neon Horizon", duration: 372 },
        { title: "Retro Glow", duration: 425 },
        { title: "Synthetic Dream", duration: 344 },
        { title: "City Lights", duration: 302 },
        { title: "Midnight Drive", duration: 280 },
        { title: "Arcade Memories", duration: 310 },
        { title: "Cyber Sunset", duration: 325 },
        { title: "Laser Love", duration: 295 },
      ],
      // Midnight Melancholy
      [
        { title: "Rainy Evening", duration: 363 },
        { title: "Lost in Thoughts", duration: 355 },
        { title: "Whispers in the Dark", duration: 455 },
        { title: "Shadows", duration: 338 },
        { title: "Cold Coffee", duration: 290 },
        { title: "Shattered Glass", duration: 315 },
        { title: "Distant Echoes", duration: 410 },
        { title: "Silent Tears", duration: 380 },
      ],
      // Acoustic Campfire
      [
        { title: "Woodland Path", duration: 400 },
        { title: "Warm Hearth", duration: 528 },
        { title: "Starlit Sky", duration: 412 },
        { title: "Morning Dew", duration: 468 },
        { title: "River Stream", duration: 385 },
        { title: "Mountain Wind", duration: 390 },
        { title: "Pine Scent", duration: 310 },
        { title: "Campfire Tales", duration: 420 },
      ],
      // Cyberpunk Drive
      [
        { title: "Glitch in the Matrix", duration: 368 },
        { title: "Digital Overload", duration: 444 },
        { title: "Hacker Mind", duration: 395 },
        { title: "Netrunner", duration: 431 },
        { title: "Data Stream", duration: 320 },
        { title: "Neon Samurai", duration: 375 },
        { title: "Neural Link", duration: 340 },
        { title: "Megacity Run", duration: 415 },
      ],
      // Lofi Study Session
      [
        { title: "Late Night Study", duration: 240 },
        { title: "Warm Tea", duration: 220 },
        { title: "Window Rain", duration: 265 },
        { title: "Cozy Blanket", duration: 215 },
        { title: "Soft Breeze", duration: 230 },
        { title: "Dreamy Vibe", duration: 250 },
        { title: "Coffee Shop", duration: 245 },
        { title: "Sleepy Cat", duration: 210 },
      ],
      // Neon Dreamscape
      [
        { title: "Electric Dreams", duration: 315 },
        { title: "Retro Future", duration: 290 },
        { title: "Grid Runner", duration: 330 },
        { title: "Sunset Boulevard", duration: 305 },
        { title: "Laser Grid", duration: 285 },
        { title: "Pixel Heart", duration: 275 },
        { title: "Synth Wave", duration: 340 },
        { title: "Outrun", duration: 295 },
      ],
      // Golden Forest
      [
        { title: "Rustling Leaves", duration: 320 },
        { title: "Golden Hour Trail", duration: 345 },
        { title: "Whispering Pines", duration: 360 },
        { title: "Forest Canopy", duration: 380 },
        { title: "Hidden Meadow", duration: 295 },
        { title: "Autumn Wind", duration: 310 },
        { title: "Sunset Peak", duration: 410 },
        { title: "Nightfall Woods", duration: 350 },
      ],
      // Digital Revolution
      [
        { title: "Code Injection", duration: 360 },
        { title: "Cyber Attack", duration: 315 },
        { title: "Mainframe Breach", duration: 420 },
        { title: "Firewall", duration: 340 },
        { title: "System Reboot", duration: 390 },
        { title: "Virtual Reality", duration: 370 },
        { title: "AI Assistant", duration: 285 },
        { title: "Binary Sunset", duration: 355 },
      ],
    ];

    const songsData = [];
    let audioIndex = 1;

    // Build songs mapping for the 8 albums
    for (let i = 0; i < createdAlbums.length; i++) {
      const album = createdAlbums[i];
      const tracks = albumTracksInfo[i];

      for (const track of tracks) {
        songsData.push({
          title: track.title,
          artist: album.artist,
          imageUrl: album.imageUrl,
          audioUrl: `https://www.soundhelix.com/examples/mp3/SoundHelix-Song-${audioIndex}.mp3`,
          duration: track.duration,
          albumId: album._id,
        });

        audioIndex = audioIndex >= 16 ? 1 : audioIndex + 1;
      }
    }

    // Define 4 singles (No Album)
    const singlesData = [
      {
        title: "Summer Breeze",
        artist: "Solar Flare",
        imageUrl:
          "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=400&auto=format&fit=crop",
        audioUrl:
          "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
        duration: 372,
      },
      {
        title: "Chill Out",
        artist: "Lofi Generator",
        imageUrl:
          "https://images.unsplash.com/photo-1518173946687-a4c8a383392e?q=80&w=400&auto=format&fit=crop",
        audioUrl:
          "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
        duration: 425,
      },
      {
        title: "Golden Hour",
        artist: "Acoustic Vibes",
        imageUrl:
          "https://images.unsplash.com/photo-1470252649378-9c29740c9fa8?q=80&w=400&auto=format&fit=crop",
        audioUrl:
          "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
        duration: 344,
      },
      {
        title: "Night Ride",
        artist: "Synthwave Rider",
        imageUrl:
          "https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=400&auto=format&fit=crop",
        audioUrl:
          "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3",
        duration: 302,
      },
    ];

    songsData.push(...singlesData);

    // Insert songs
    const createdSongs = await Song.insertMany(songsData);
    console.log(`Created ${createdSongs.length} songs.`);

    // Map inserted songs back to their respective albums' "songs" arrays
    for (const album of createdAlbums) {
      const albumSongs = createdSongs.filter(
        (song) =>
          song.albumId && song.albumId.toString() === album._id.toString(),
      );
      album.songs = albumSongs.map((song) => song._id);
      await album.save();
    }
    console.log(
      "Successfully updated Album documents with their respective song IDs.",
    );
    console.log("Database seeding completed successfully!");
  } catch (error) {
    console.error("Error during seeding:", error);
  } finally {
    await mongoose.connection.close();
    console.log("MongoDB connection closed.");
    process.exit(0);
  }
};

seedDatabase();
