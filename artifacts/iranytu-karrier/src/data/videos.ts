export type VideoResource = {
  title: string;
  description: string;
  url: string;
};

// Add each public YouTube or Vimeo video here. GitHub Pages rebuilds the site
// after this file is committed, so no new video upload is needed in this repo.
export const videos: VideoResource[] = [];
