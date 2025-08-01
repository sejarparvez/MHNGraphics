import { mergeAttributes, Node } from '@tiptap/core';

export interface YoutubeOptions {
  allowFullscreen?: boolean;
  autoplay?: boolean;
  nocookie?: boolean;
  controls?: boolean;
  HTMLAttributes: {
    // biome-ignore lint: error
    [key: string]: any;
  };
}

type EmbedYoutubeOptions = { src: string; width?: number; height?: number };

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    youtube: {
      embedYoutube: (options: EmbedYoutubeOptions) => ReturnType;
    };
  }
}

export const Youtube = Node.create<YoutubeOptions>({
  name: 'youtube',
  group: 'block',
  draggable: true,
  atom: true,

  addOptions() {
    return {
      allowFullscreen: true,
      autoplay: false,
      nocookie: false,
      controls: true,
      HTMLAttributes: {},
    };
  },

  addAttributes() {
    return {
      src: {
        default: null,
      },
      width: {
        default: null,
        parseHTML: (element) => Number.parseInt(element.style.width) || null,
        renderHTML: (attrs) => {
          if (!attrs.width) return {};
          return { style: `width: ${attrs.width}%` };
        },
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'iframe[src]',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'iframe',
      mergeAttributes(
        this.options.HTMLAttributes,
        {
          with: 200,
          height: 120,
          allowfullscreen: this.options.allowFullscreen ? 'true' : undefined,
          autoplay: this.options.autoplay ? 'true' : undefined,
        },
        HTMLAttributes,
      ),
    ];
  },

  addCommands() {
    return {
      embedYoutube:
        (options: { src: string }) =>
        ({ commands }) => {
          if (!isValidYoutubeUrl(options.src)) {
            return false;
          }

          const embedUrl = getEmbedYoutubeUrl({
            url: options.src,
            allowFullscreen: this.options.allowFullscreen,
            autoplay: this.options.autoplay,
            controls: this.options.controls,
            nocookie: this.options.nocookie,
          });

          if (!embedUrl) return false;

          return commands.insertContent({
            type: this.name,
            attrs: { ...options, src: embedUrl },
          });
        },
    };
  },

  addNodeView() {
    return ({ node }) => {
      const iframe = document.createElement('iframe');
      iframe.src = node.attrs.src;

      const dom = document.createElement('div');
      dom.style.cursor = 'default';
      dom.style.marginInline = 'auto';
      dom.style.width = `${node.attrs.width}%`;
      dom.appendChild(iframe);

      return {
        dom,
      };
    };
  },
});

const YOUTUBE_REGEX =
  /^(https?:\/\/)?(www\.|music\.)?(youtube\.com|youtu\.be|youtube-nocookie\.com)\/(?!channel\/)(?!@)(.+)?$/;

export function isValidYoutubeUrl(url: string) {
  return url.match(YOUTUBE_REGEX);
}

type GetEmbedYoutubeUrlOptions = {
  url: string;
  allowFullscreen?: boolean;
  autoplay?: boolean;
  nocookie?: boolean;
  controls?: boolean;
};

export function getEmbedYoutubeUrl({
  url,
  nocookie,
  allowFullscreen,
  autoplay,
  controls,
}: GetEmbedYoutubeUrlOptions) {
  if (!isValidYoutubeUrl(url)) {
    return null;
  }

  // if is already an embed url, return it
  if (url.includes('/embed/')) {
    return url;
  }

  const videoIdRegex = /(?:v=|shorts\/)([-\w]+)/gm;
  const matches = videoIdRegex.exec(url);

  if (!matches || !matches[1]) {
    return null;
  }

  const outputUrl =
    (nocookie
      ? 'https://www.youtube-nocookie.com/embed/'
      : 'https://www.youtube.com/embed/') + matches[1];

  const params = [];

  if (!allowFullscreen) {
    params.push('fs=0');
  }

  if (autoplay) {
    params.push('autoplay=1');
  }

  if (!controls) {
    params.push('controls=0');
  }

  return outputUrl;
}
