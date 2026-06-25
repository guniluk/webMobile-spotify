import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  TextInput,
  Platform,
  Alert,
} from "react-native";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  ArrowLeft,
  Plus,
  Trash2,
  Image as ImageIcon,
  Music,
  Database,
  Users,
  Disc,
  FileAudio,
} from "lucide-react-native";
import * as ImagePicker from "expo-image-picker";
import * as DocumentPicker from "expo-document-picker";
import { useMusicStore, Song, Album } from "@/store/useMusicStore";

export default function AdminScreen() {
  const router = useRouter();

  // 글로벌 스토어 참조
  const {
    songs,
    albums,
    stats,
    isLoading,
    fetchSongs,
    fetchAlbums,
    fetchStats,
    deleteSong,
    deleteAlbum,
    createSong,
    createAlbum,
  } = useMusicStore();

  // 내부 상태 정의
  const [activeTab, setActiveTab] = useState<"songs" | "albums">("songs");
  const [isSongModalOpen, setIsSongModalOpen] = useState(false);
  const [isAlbumModalOpen, setIsAlbumModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 1. 노래 추가 폼 필드
  const [songTitle, setSongTitle] = useState("");
  const [songArtist, setSongArtist] = useState("");
  const [songDuration, setSongDuration] = useState("");
  const [selectedAlbumId, setSelectedAlbumId] = useState<string>("");
  const [songImage, setSongImage] = useState<{
    uri: string;
    name: string;
    type: string;
  } | null>(null);
  const [songAudio, setSongAudio] = useState<{
    uri: string;
    name: string;
    type: string;
  } | null>(null);

  // 2. 앨범 추가 폼 필드
  const [albumTitle, setAlbumTitle] = useState("");
  const [albumArtist, setAlbumArtist] = useState("");
  const [albumYear, setAlbumYear] = useState(
    new Date().getFullYear().toString(),
  );
  const [albumImage, setAlbumImage] = useState<{
    uri: string;
    name: string;
    type: string;
  } | null>(null);

  // 데이터 로드
  useEffect(() => {
    fetchSongs();
    fetchAlbums();
    fetchStats();
  }, [fetchSongs, fetchAlbums, fetchStats]);

  // 이미지 선택 처리
  const pickImage = async (type: "song" | "album") => {
    const permissionResult =
      await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert("권한 필요", "갤러리 접근 권한이 필요합니다.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const asset = result.assets[0];
      const imgData = {
        uri:
          Platform.OS === "ios" ? asset.uri.replace("file://", "") : asset.uri,
        name: asset.fileName || `${Date.now()}_image.jpg`,
        type: asset.mimeType || "image/jpeg",
      };

      if (type === "song") {
        setSongImage(imgData);
      } else {
        setAlbumImage(imgData);
      }
    }
  };

  // 오디오 선택 처리
  const pickAudio = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "audio/*",
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        setSongAudio({
          uri:
            Platform.OS === "ios"
              ? asset.uri.replace("file://", "")
              : asset.uri,
          name: asset.name || `${Date.now()}_audio.mp3`,
          type: asset.mimeType || "audio/mpeg",
        });
      }
    } catch (error) {
      console.error("Audio pick failed:", error);
    }
  };

  // 노래 추가 등록 액션
  const handleAddSong = async () => {
    if (
      !songTitle.trim() ||
      !songArtist.trim() ||
      !songDuration.trim() ||
      !songImage ||
      !songAudio
    ) {
      Alert.alert("입력 오류", "모든 필수 필드와 파일을 등록해주세요.");
      return;
    }

    const durationSec = parseInt(songDuration, 10);
    if (isNaN(durationSec) || durationSec <= 0) {
      Alert.alert(
        "입력 오류",
        "재생 시간은 양의 정수(초 단위)로 입력해주세요.",
      );
      return;
    }

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("title", songTitle.trim());
      formData.append("artist", songArtist.trim());
      formData.append("duration", durationSec.toString());
      if (selectedAlbumId) {
        formData.append("albumId", selectedAlbumId);
      }

      // React Native FormData 형식 준수
      formData.append("imageFile", {
        uri: songImage.uri,
        name: songImage.name,
        type: songImage.type,
      } as any);

      formData.append("audioFile", {
        uri: songAudio.uri,
        name: songAudio.name,
        type: songAudio.type,
      } as any);

      await createSong(formData);
      Alert.alert("완료", "노래가 정상적으로 추가되었습니다.");

      // 입력 폼 리셋
      setSongTitle("");
      setSongArtist("");
      setSongDuration("");
      setSelectedAlbumId("");
      setSongImage(null);
      setSongAudio(null);
      setIsSongModalOpen(false);
    } catch (error) {
      Alert.alert("등록 실패", "노래 추가에 실패했습니다.");
      console.error("Song add failed:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // 앨범 추가 등록 액션
  const handleAddAlbum = async () => {
    if (
      !albumTitle.trim() ||
      !albumArtist.trim() ||
      !albumYear.trim() ||
      !albumImage
    ) {
      Alert.alert("입력 오류", "모든 필드와 이미지 파일을 등록해주세요.");
      return;
    }

    const yearNum = parseInt(albumYear, 10);
    if (isNaN(yearNum) || yearNum <= 1900 || yearNum > 2100) {
      Alert.alert("입력 오류", "올바른 연도를 입력해 주세요.");
      return;
    }

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("title", albumTitle.trim());
      formData.append("artist", albumArtist.trim());
      formData.append("releaseYear", yearNum.toString());

      formData.append("imageFile", {
        uri: albumImage.uri,
        name: albumImage.name,
        type: albumImage.type,
      } as any);

      await createAlbum(formData);
      Alert.alert("완료", "앨범이 정상적으로 생성되었습니다.");

      // 입력 폼 리셋
      setAlbumTitle("");
      setAlbumArtist("");
      setAlbumYear(new Date().getFullYear().toString());
      setAlbumImage(null);
      setIsAlbumModalOpen(false);
    } catch (error) {
      Alert.alert("생성 실패", "앨범 생성에 실패했습니다.");
      console.error("Album add failed:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // 노래 삭제 승인
  const handleDeleteSong = (song: Song) => {
    Alert.alert(
      "노래 삭제",
      `"${song.title}" 음원을 삭제하시겠습니까?\n삭제 후 복구 불가능합니다.`,
      [
        { text: "취소", style: "cancel" },
        {
          text: "삭제",
          style: "destructive",
          onPress: () => deleteSong(song._id),
        },
      ],
    );
  };

  // 앨범 삭제 승인
  const handleDeleteAlbum = (album: Album) => {
    Alert.alert(
      "앨범 삭제",
      `"${album.title}" 앨범과 포함된 모든 곡을 삭제하시겠습니까?\n이 작업은 되돌릴 수 없습니다.`,
      [
        { text: "취소", style: "cancel" },
        {
          text: "삭제",
          style: "destructive",
          onPress: () => deleteAlbum(album._id),
        },
      ],
    );
  };

  return (
    <SafeAreaView
      className="flex-1 bg-[#121212]"
      edges={["top", "left", "right"]}
    >
      {/* 1. Header */}
      <View className="flex-row items-center justify-between px-4 py-3.5 border-b border-zinc-900 bg-[#121212]">
        <View className="flex-row items-center">
          <TouchableOpacity onPress={() => router.back()} className="p-1 mr-2">
            <ArrowLeft size={24} color="white" />
          </TouchableOpacity>
          <Text className="text-lg font-black tracking-tight text-white">
            Admin Dashboard
          </Text>
        </View>
      </View>

      <ScrollView
        className="flex-1 px-4 mt-4"
        contentContainerStyle={{ paddingBottom: 60 }}
      >
        {/* 2. Stats Grid */}
        <Text className="mb-3 text-base font-bold text-white">
          전체 통계 개요
        </Text>
        <View className="flex-row flex-wrap justify-between mb-6 gap-y-3">
          <View className="w-[48%] bg-zinc-900/60 p-4 rounded-xl border border-zinc-800 flex-row items-center gap-3">
            <Music size={20} color="#10B981" />
            <View>
              <Text className="text-[10px] text-zinc-400">총 곡 수</Text>
              <Text className="text-base font-black text-white">
                {stats?.totalSongs ?? 0}
              </Text>
            </View>
          </View>
          <View className="w-[48%] bg-zinc-900/60 p-4 rounded-xl border border-zinc-800 flex-row items-center gap-3">
            <Disc size={20} color="#10B981" />
            <View>
              <Text className="text-[10px] text-zinc-400">총 앨범 수</Text>
              <Text className="text-base font-black text-white">
                {stats?.totalAlbums ?? 0}
              </Text>
            </View>
          </View>
          <View className="w-[48%] bg-zinc-900/60 p-4 rounded-xl border border-zinc-800 flex-row items-center gap-3">
            <Users size={20} color="#10B981" />
            <View>
              <Text className="text-[10px] text-zinc-400">총 사용자 수</Text>
              <Text className="text-base font-black text-white">
                {stats?.totalUsers ?? 0}
              </Text>
            </View>
          </View>
          <View className="w-[48%] bg-zinc-900/60 p-4 rounded-xl border border-zinc-800 flex-row items-center gap-3">
            <Database size={20} color="#10B981" />
            <View>
              <Text className="text-[10px] text-zinc-400">아티스트 수</Text>
              <Text className="text-base font-black text-white">
                {stats?.uniqueArtists ?? 0}
              </Text>
            </View>
          </View>
        </View>

        {/* 3. Navigation Tabs */}
        <View className="flex-row bg-zinc-900/90 p-1.5 rounded-full border border-zinc-850 mb-4">
          <TouchableOpacity
            onPress={() => setActiveTab("songs")}
            className={`flex-1 py-2.5 rounded-full items-center justify-center ${
              activeTab === "songs" ? "bg-emerald-500" : ""
            }`}
          >
            <Text
              className={`text-xs font-bold ${activeTab === "songs" ? "text-black" : "text-zinc-400"}`}
            >
              음악 관리
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setActiveTab("albums")}
            className={`flex-1 py-2.5 rounded-full items-center justify-center ${
              activeTab === "albums" ? "bg-emerald-500" : ""
            }`}
          >
            <Text
              className={`text-xs font-bold ${activeTab === "albums" ? "text-black" : "text-zinc-400"}`}
            >
              앨범 관리
            </Text>
          </TouchableOpacity>
        </View>

        {/* 4. Tab Contents */}
        {activeTab === "songs" ? (
          <View>
            <View className="flex-row items-center justify-between mb-3">
              <Text className="text-sm font-bold text-white">
                노래 목록 ({songs.length}곡)
              </Text>
              <TouchableOpacity
                onPress={() => setIsSongModalOpen(true)}
                className="flex-row items-center bg-emerald-500 px-3 py-1.5 rounded-full"
              >
                <Plus size={14} color="black" />
                <Text className="ml-1 text-xs font-bold text-black">
                  곡 추가
                </Text>
              </TouchableOpacity>
            </View>

            {/* Songs List */}
            {isLoading && songs.length === 0 ? (
              <ActivityIndicator
                color="#10B981"
                size="small"
                className="py-12"
              />
            ) : (
              <View className="overflow-hidden border bg-zinc-900/40 border-zinc-900 rounded-xl">
                {songs.map((song) => (
                  <View
                    key={song._id}
                    className="flex-row items-center justify-between p-3 border-b border-zinc-900/45"
                  >
                    <View className="flex-row items-center flex-1 mr-4">
                      <Image
                        source={
                          song.imageUrl ? { uri: song.imageUrl } : undefined
                        }
                        className="w-10 h-10 mr-3 rounded bg-zinc-800"
                        style={{ width: 40, height: 40 }}
                      />
                      <View className="flex-1">
                        <Text
                          numberOfLines={1}
                          className="text-xs font-bold text-white"
                        >
                          {song.title}
                        </Text>
                        <Text
                          numberOfLines={1}
                          className="text-zinc-400 text-[10px] mt-0.5"
                        >
                          {song.artist}
                        </Text>
                      </View>
                    </View>
                    <TouchableOpacity
                      onPress={() => handleDeleteSong(song)}
                      className="p-2 border rounded-full bg-red-500/10 border-red-500/20"
                    >
                      <Trash2 size={13} color="#F87171" />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}
          </View>
        ) : (
          <View>
            <View className="flex-row items-center justify-between mb-3">
              <Text className="text-sm font-bold text-white">
                앨범 목록 ({albums.length}개)
              </Text>
              <TouchableOpacity
                onPress={() => setIsAlbumModalOpen(true)}
                className="flex-row items-center bg-emerald-500 px-3 py-1.5 rounded-full"
              >
                <Plus size={14} color="black" />
                <Text className="ml-1 text-xs font-bold text-black">
                  앨범 추가
                </Text>
              </TouchableOpacity>
            </View>

            {/* Albums List */}
            {isLoading && albums.length === 0 ? (
              <ActivityIndicator
                color="#10B981"
                size="small"
                className="py-12"
              />
            ) : (
              <View className="overflow-hidden border bg-zinc-900/40 border-zinc-900 rounded-xl">
                {albums.map((album) => (
                  <View
                    key={album._id}
                    className="flex-row items-center justify-between p-3 border-b border-zinc-900/45"
                  >
                    <View className="flex-row items-center flex-1 mr-4">
                      <Image
                        source={
                          album.imageUrl ? { uri: album.imageUrl } : undefined
                        }
                        className="w-10 h-10 mr-3 rounded bg-zinc-800"
                        style={{ width: 40, height: 40 }}
                      />
                      <View className="flex-1">
                        <Text
                          numberOfLines={1}
                          className="text-xs font-bold text-white"
                        >
                          {album.title}
                        </Text>
                        <Text
                          numberOfLines={1}
                          className="text-zinc-400 text-[10px] mt-0.5"
                        >
                          {album.artist} • {album.releaseYear}년 (
                          {album.songs.length}곡)
                        </Text>
                      </View>
                    </View>
                    <TouchableOpacity
                      onPress={() => handleDeleteAlbum(album)}
                      className="p-2 border rounded-full bg-red-500/10 border-red-500/20"
                    >
                      <Trash2 size={13} color="#F87171" />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}
          </View>
        )}
      </ScrollView>

      {/* 5. 노래 추가 모달 */}
      <Modal
        visible={isSongModalOpen}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsSongModalOpen(false)}
      >
        <View className="items-center justify-center flex-1 px-4 bg-black/80">
          <View className="w-full max-h-[85%] bg-zinc-950 border border-zinc-900 p-6 rounded-2xl">
            <Text className="mb-4 text-base font-black text-white">
              새로운 음원 추가
            </Text>

            <ScrollView className="mb-4">
              <Text className="mb-1 text-xs font-bold text-zinc-400">
                곡 제목 *
              </Text>
              <TextInput
                placeholder="제목을 입력하세요"
                placeholderTextColor="#4B5563"
                value={songTitle}
                onChangeText={setSongTitle}
                className="w-full bg-zinc-900 border border-zinc-850 p-2.5 rounded-lg text-white text-xs mb-3"
              />

              <Text className="mb-1 text-xs font-bold text-zinc-400">
                아티스트 *
              </Text>
              <TextInput
                placeholder="아티스트명을 입력하세요"
                placeholderTextColor="#4B5563"
                value={songArtist}
                onChangeText={setSongArtist}
                className="w-full bg-zinc-900 border border-zinc-850 p-2.5 rounded-lg text-white text-xs mb-3"
              />

              <Text className="mb-1 text-xs font-bold text-zinc-400">
                재생 시간 (초) *
              </Text>
              <TextInput
                placeholder="예: 210 (초 단위)"
                placeholderTextColor="#4B5563"
                value={songDuration}
                onChangeText={setSongDuration}
                keyboardType="numeric"
                className="w-full bg-zinc-900 border border-zinc-850 p-2.5 rounded-lg text-white text-xs mb-3"
              />

              <Text className="mb-1 text-xs font-bold text-zinc-400">
                소속 앨범 (선택)
              </Text>
              <View className="flex-row flex-wrap gap-2 mb-4">
                <TouchableOpacity
                  onPress={() => setSelectedAlbumId("")}
                  className={`px-3 py-1.5 rounded-full border ${
                    selectedAlbumId === ""
                      ? "bg-emerald-500/20 border-emerald-500"
                      : "bg-zinc-900 border-zinc-800"
                  }`}
                >
                  <Text
                    className={`text-[10px] font-bold ${selectedAlbumId === "" ? "text-emerald-400" : "text-zinc-400"}`}
                  >
                    싱글 (앨범 없음)
                  </Text>
                </TouchableOpacity>
                {albums.map((album) => (
                  <TouchableOpacity
                    key={album._id}
                    onPress={() => setSelectedAlbumId(album._id)}
                    className={`px-3 py-1.5 rounded-full border ${
                      selectedAlbumId === album._id
                        ? "bg-emerald-500/20 border-emerald-500"
                        : "bg-zinc-900 border-zinc-800"
                    }`}
                  >
                    <Text
                      className={`text-[10px] font-bold ${selectedAlbumId === album._id ? "text-emerald-400" : "text-zinc-400"}`}
                    >
                      {album.title}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* 이미지 파일 피커 */}
              <Text className="mb-1 text-xs font-bold text-zinc-400">
                커버 이미지 업로드 *
              </Text>
              <TouchableOpacity
                onPress={() => pickImage("song")}
                className="flex-row items-center justify-center w-full h-12 mb-3 border border-dashed rounded-lg border-zinc-800 bg-zinc-900/50"
              >
                <ImageIcon size={16} color="#9CA3AF" />
                <Text className="ml-2 text-xs font-semibold text-zinc-400">
                  {songImage ? "이미지 선택 완료" : "커버 아트 선택"}
                </Text>
              </TouchableOpacity>
              {songImage && (
                <View className="items-center mb-4">
                  <Image
                    source={{ uri: songImage.uri }}
                    className="w-20 h-20 rounded bg-zinc-900"
                    style={{ width: 80, height: 80 }}
                  />
                </View>
              )}

              {/* 오디오 파일 피커 */}
              <Text className="mb-1 text-xs font-bold text-zinc-400">
                음원 파일 업로드 (.mp3 등) *
              </Text>
              <TouchableOpacity
                onPress={pickAudio}
                className="flex-row items-center justify-center w-full h-12 mb-4 border border-dashed rounded-lg border-zinc-800 bg-zinc-900/50"
              >
                <FileAudio size={16} color="#9CA3AF" />
                <Text className="ml-2 text-xs font-semibold text-zinc-400">
                  {songAudio ? songAudio.name : "음원 파일 선택"}
                </Text>
              </TouchableOpacity>
            </ScrollView>

            {/* Action Buttons */}
            <View className="flex-row gap-3">
              <TouchableOpacity
                onPress={() => setIsSongModalOpen(false)}
                disabled={isSubmitting}
                className="items-center flex-1 py-3 border rounded-full bg-zinc-900 border-zinc-800"
              >
                <Text className="text-xs font-bold text-zinc-400">취소</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleAddSong}
                disabled={isSubmitting}
                className="items-center justify-center flex-1 py-3 rounded-full bg-emerald-500"
              >
                {isSubmitting ? (
                  <ActivityIndicator color="black" size="small" />
                ) : (
                  <Text className="text-xs font-bold text-black">
                    추가 완료
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* 6. 앨범 추가 모달 */}
      <Modal
        visible={isAlbumModalOpen}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsAlbumModalOpen(false)}
      >
        <View className="items-center justify-center flex-1 px-4 bg-black/80">
          <View className="w-full p-6 border bg-zinc-950 border-zinc-900 rounded-2xl">
            <Text className="mb-4 text-base font-black text-white">
              새로운 앨범 추가
            </Text>

            <ScrollView className="mb-4">
              <Text className="mb-1 text-xs font-bold text-zinc-400">
                앨범 제목 *
              </Text>
              <TextInput
                placeholder="제목을 입력하세요"
                placeholderTextColor="#4B5563"
                value={albumTitle}
                onChangeText={setAlbumTitle}
                className="w-full bg-zinc-900 border border-zinc-850 p-2.5 rounded-lg text-white text-xs mb-3"
              />

              <Text className="mb-1 text-xs font-bold text-zinc-400">
                아티스트 *
              </Text>
              <TextInput
                placeholder="아티스트명을 입력하세요"
                placeholderTextColor="#4B5563"
                value={albumArtist}
                onChangeText={setAlbumArtist}
                className="w-full bg-zinc-900 border border-zinc-850 p-2.5 rounded-lg text-white text-xs mb-3"
              />

              <Text className="mb-1 text-xs font-bold text-zinc-400">
                발매 연도 *
              </Text>
              <TextInput
                placeholder="예: 2026"
                placeholderTextColor="#4B5563"
                value={albumYear}
                onChangeText={setAlbumYear}
                keyboardType="numeric"
                className="w-full bg-zinc-900 border border-zinc-850 p-2.5 rounded-lg text-white text-xs mb-4"
              />

              {/* 이미지 파일 피커 */}
              <Text className="mb-1 text-xs font-bold text-zinc-400">
                커버 이미지 업로드 *
              </Text>
              <TouchableOpacity
                onPress={() => pickImage("album")}
                className="flex-row items-center justify-center w-full h-12 mb-3 border border-dashed rounded-lg border-zinc-800 bg-zinc-900/50"
              >
                <ImageIcon size={16} color="#9CA3AF" />
                <Text className="ml-2 text-xs font-semibold text-zinc-400">
                  {albumImage ? "이미지 선택 완료" : "커버 아트 선택"}
                </Text>
              </TouchableOpacity>
              {albumImage && (
                <View className="items-center mb-2">
                  <Image
                    source={{ uri: albumImage.uri }}
                    className="w-20 h-20 rounded bg-zinc-900"
                    style={{ width: 80, height: 80 }}
                  />
                </View>
              )}
            </ScrollView>

            {/* Action Buttons */}
            <View className="flex-row gap-3">
              <TouchableOpacity
                onPress={() => setIsAlbumModalOpen(false)}
                disabled={isSubmitting}
                className="items-center flex-1 py-3 border rounded-full bg-zinc-900 border-zinc-800"
              >
                <Text className="text-xs font-bold text-zinc-400">취소</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleAddAlbum}
                disabled={isSubmitting}
                className="items-center justify-center flex-1 py-3 rounded-full bg-emerald-500"
              >
                {isSubmitting ? (
                  <ActivityIndicator color="black" size="small" />
                ) : (
                  <Text className="text-xs font-bold text-black">
                    생성 완료
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
