export interface VideoState {
  videoSrc: string | null;
  videoFile: any | null;
  gearId: number;
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
  movieData: any;
}
