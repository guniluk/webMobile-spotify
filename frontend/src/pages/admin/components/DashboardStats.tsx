import { useMusicStore } from "@/store/useMusicStore";
import { Music, Disc, Users, User } from "lucide-react";

const DashboardStats = () => {
  const { stats } = useMusicStore();

  const statItems = [
    {
      title: "Total Songs",
      value: stats?.totalSongs ?? 0,
      icon: Music,
      bgColor: "bg-emerald-500/10",
      iconColor: "text-emerald-500",
      borderColor: "border-emerald-500/20",
    },
    {
      title: "Total Albums",
      value: stats?.totalAlbums ?? 0,
      icon: Disc,
      bgColor: "bg-violet-500/10",
      iconColor: "text-violet-500",
      borderColor: "border-violet-500/20",
    },
    {
      title: "Total Artists",
      value: stats?.uniqueArtists ?? 0,
      icon: Users,
      bgColor: "bg-orange-500/10",
      iconColor: "text-orange-500",
      borderColor: "border-orange-500/20",
    },
    {
      title: "Total Users",
      value: stats?.totalUsers ?? 0,
      icon: User,
      bgColor: "bg-pink-500/10",
      iconColor: "text-pink-500",
      borderColor: "border-pink-500/20",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {statItems.map((item, index) => {
        const Icon = item.icon;
        return (
          <div
            key={index}
            className={`p-6 rounded-xl bg-zinc-900 border ${item.borderColor} hover:bg-zinc-800/80 transition-all duration-300 group`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-zinc-400 text-sm font-medium mb-1">
                  {item.title}
                </p>
                <h3 className="text-3xl font-bold text-white tracking-tight group-hover:scale-105 transition-transform duration-300 origin-left">
                  {item.value.toLocaleString()}
                </h3>
              </div>
              <div className={`p-3 rounded-lg ${item.bgColor} ${item.iconColor} group-hover:rotate-6 transition-transform duration-300`}>
                <Icon size={24} />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default DashboardStats;
