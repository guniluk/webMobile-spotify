import { useEffect, useState } from "react";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { Outlet } from "react-router-dom";
import LeftSidebar from "./LeftSidebar";
import RightSidebar from "./RightSidebar";
import { usePlayerStore } from "@/store/usePlayerStore";
import PlaybackControls from "@/components/PlaybackControls";

const MainLayout = () => {
  const isMobile = false;
  const { currentSong } = usePlayerStore();

  const [showRightSidebar, setShowRightSidebar] = useState(
    typeof window !== "undefined" ? window.innerWidth >= 1024 : true,
  );

  useEffect(() => {
    const handleResize = () => {
      setShowRightSidebar(window.innerWidth >= 1024);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="flex flex-col h-screen p-2 text-white bg-black">
      <ResizablePanelGroup
        orientation="horizontal"
        className="flex flex-1 h-full gap-2 overflow-hidden"
      >
        {/* left sidebar */}
        <ResizablePanel
          defaultSize="28"
          maxSize="40"
          minSize={isMobile ? "0" : "20"}
        >
          <LeftSidebar />
        </ResizablePanel>

        <ResizableHandle className="w-1 transition-colors bg-transparent hover:bg-neutral-800" />

        {/* main Content */}
        <ResizablePanel defaultSize={isMobile ? "80" : "52"}>
          <div className="h-full bg-[#121212] rounded-lg p-4 overflow-y-auto">
            <Outlet />
          </div>
        </ResizablePanel>

        {showRightSidebar && (
          <>
            <ResizableHandle className="w-1 transition-colors bg-transparent hover:bg-neutral-800" />

            {/* right sidebar */}
            <ResizablePanel
              defaultSize="20"
              maxSize="25"
              minSize="0"
              collapsedSize="0"
            >
              <RightSidebar />
            </ResizablePanel>
          </>
        )}
      </ResizablePanelGroup>

      {currentSong && <PlaybackControls />}
    </div>
  );
};

export default MainLayout;
