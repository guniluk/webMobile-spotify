import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from '@/components/ui/resizable';
import { Outlet } from 'react-router-dom';
import LeftSidebar from './LeftSidebar';
import RightSidebar from './RightSidebar';
import { usePlayerStore } from '@/store/usePlayerStore';
import PlaybackControls from '@/components/PlaybackControls';

const MainLayout = () => {
  const isMobile = false;
  const { currentSong } = usePlayerStore();

  return (
    <div className="h-screen flex flex-col bg-black text-white p-2">
      <ResizablePanelGroup
        orientation="horizontal"
        className="flex-1 flex h-full overflow-hidden gap-2"
      >
        {/* left sidebar */}
        <ResizablePanel
          defaultSize="28"
          maxSize="40"
          minSize={isMobile ? '0' : '20'}
        >
          <LeftSidebar />
        </ResizablePanel>

        <ResizableHandle className="w-1 bg-transparent hover:bg-neutral-800 transition-colors" />

        {/* main Content */}
        <ResizablePanel defaultSize={isMobile ? '80' : '52'}>
          <div className="h-full bg-[#121212] rounded-lg p-4 overflow-y-auto">
            <Outlet />
          </div>
        </ResizablePanel>

        <ResizableHandle className="w-1 bg-transparent hover:bg-neutral-800 transition-colors" />

        {/* right sidebar */}
        <ResizablePanel
          defaultSize="20"
          maxSize="25"
          minSize="0"
          collapsedSize="0"
        >
          <RightSidebar />
        </ResizablePanel>
      </ResizablePanelGroup>

      {currentSong && <PlaybackControls />}
    </div>
  );
};

export default MainLayout;
