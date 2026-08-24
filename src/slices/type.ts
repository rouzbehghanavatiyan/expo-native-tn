export interface VideoState {
  videoSrc: string | null;
  videoFile: any | null;
  isWaitingForMatch?: boolean;
  showTimeout: boolean;
  isLoading: boolean;
  needProfileRefresh: boolean;
  selectedResize: number;
  showDeactivatedModal: boolean;
  error: string | null;
  currentStep: number;
  uploadStatus: "idle" | "success" | "failed";
  resMovieData: any | null;
  movieData: {
    parentId: number | null;
    userId: number | null;
    movieId: number | null;
    status: number | null;
    inviteId: number | null;
    title: string;
    desc: string;
    trimStart: number;
    trimEnd: number;
    duration: number;
  };
}
