import { APP_NAME } from '@hey/data/constants';
import getURLs from '@hey/lib/getURLs';
import getNft from '@hey/lib/nft/getNft';
import {
  audio,
  image,
  liveStream,
  mint,
  textOnly,
  video
} from '@lens-protocol/metadata';
import getUserLocale from '@lib/getUserLocale';
import { useCallback } from 'react';
import { usePublicationStore } from 'src/store/non-persisted/usePublicationStore';
import { v4 as uuid } from 'uuid';

interface UsePublicationMetadataProps {
  baseMetadata: any;
}

const usePublicationMetadata = () => {
  const attachments = usePublicationStore((state) => state.attachments);
  const audioPublication = usePublicationStore(
    (state) => state.audioPublication
  );
  const videoThumbnail = usePublicationStore((state) => state.videoThumbnail);
  const videoDurationInSeconds = usePublicationStore(
    (state) => state.videoDurationInSeconds
  );
  const showLiveVideoEditor = usePublicationStore(
    (state) => state.showLiveVideoEditor
  );
  const liveVideoConfig = usePublicationStore((state) => state.liveVideoConfig);

  const attachmentsHasAudio = attachments[0]?.type === 'Audio';
  const attachmentsHasVideo = attachments[0]?.type === 'Video';

  const cover = attachmentsHasAudio
    ? audioPublication.cover
    : attachmentsHasVideo
      ? videoThumbnail.url
      : attachments[0]?.uri;

  const getMetadata = useCallback(
    ({ baseMetadata }: UsePublicationMetadataProps) => {
      const urls = getURLs(baseMetadata.content);

      const hasAttachments = attachments.length;
      const isImage = attachments[0]?.type === 'Image';
      const isAudio = attachments[0]?.type === 'Audio';
      const isVideo = attachments[0]?.type === 'Video';
      const isMint = Boolean(getNft(urls)?.mintLink);
      const isLiveStream = Boolean(showLiveVideoEditor && liveVideoConfig.id);

      const localBaseMetadata = {
        appId: APP_NAME,
        id: uuid(),
        locale: getUserLocale()
      };

      const attachmentsToBeUploaded = attachments.map((attachment) => ({
        cover: cover,
        item: attachment.uri,
        type: attachment.mimeType
      }));

      switch (true) {
        case isMint:
          return mint({
            ...baseMetadata,
            ...localBaseMetadata,
            ...(hasAttachments && { attachments: attachmentsToBeUploaded }),
            mintLink: getNft(urls)?.mintLink
          });
        case isLiveStream:
          return liveStream({
            ...baseMetadata,
            ...localBaseMetadata,
            liveUrl: `https://livepeercdn.studio/hls/${liveVideoConfig.playbackId}/index.m3u8`,
            playbackUrl: `https://livepeercdn.studio/hls/${liveVideoConfig.playbackId}/index.m3u8`,
            startsAt: new Date().toISOString()
          });
        case !hasAttachments:
          return textOnly({
            ...baseMetadata,
            ...localBaseMetadata
          });
        case isImage:
          return image({
            ...baseMetadata,
            ...localBaseMetadata,
            attachments: attachmentsToBeUploaded,
            image: {
              item: attachments[0]?.uri,
              type: attachments[0]?.mimeType
            }
          });
        case isAudio:
          return audio({
            ...baseMetadata,
            ...localBaseMetadata,
            attachments: attachmentsToBeUploaded,
            audio: {
              artist: audioPublication.artist,
              cover: audioPublication.cover,
              item: attachments[0]?.uri,
              type: attachments[0]?.mimeType
            }
          });
        case isVideo:
          return video({
            ...baseMetadata,
            ...localBaseMetadata,
            attachments: attachmentsToBeUploaded,
            video: {
              duration: parseInt(videoDurationInSeconds),
              item: attachments[0]?.uri,
              type: attachments[0]?.mimeType
            }
          });
        default:
          return null;
      }
    },
    [
      attachments,
      videoDurationInSeconds,
      audioPublication,
      cover,
      showLiveVideoEditor,
      liveVideoConfig
    ]
  );

  return getMetadata;
};

export default usePublicationMetadata;
