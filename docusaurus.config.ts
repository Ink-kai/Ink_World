import { themes as prismThemes } from "prism-react-renderer";
import type { Config } from "@docusaurus/types";
import type * as Preset from "@docusaurus/preset-classic";
import remarkMDX from 'remark-mdx';

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

const config: Config = {
  title: "Ink World",
  headTags: [
    {
      tagName: "link",
      attributes: {
        rel: "icon",
        href: "/img/docusaurus.png",
      },
    },
  ],
  tagline: "Welcome to Ink World",
  favicon: "img/favicon.ico",
  // Set the production url of your site here
  url: "https://inkworld.top",
  // Set the /<baseUrl>/ pathname under which your site is served
  // For GitHub pages deployment, it is often '/<projectName>/'
  baseUrl: "/",
  // GitHub pages deployment config.
  // If you aren't using GitHub pages, you don't need these.
  // organizationName: "facebook", // Usually your GitHub org/user name.
  projectName: "Ink World", // Usually your repo name.
  onBrokenLinks: "warn",
  onBrokenMarkdownLinks: "warn",
  // Even if you don't use internationalization, you can use this field to set
  // useful metadata like html lang. For example, if your site is Chinese, you
  // may want to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: "zh",
    locales: ["zh", "en"],
    localeConfigs: {
      zh: {
        label: "中文",
        // direction: "ltr",
        htmlLang: "zh-CN",
        calendar: "gregory",
        path: "zh",
      },
      en: {
        label: "English",
        // direction: "ltr",
        htmlLang: "en-US",
        calendar: "gregory",
        path: "en",
      },
    },
  },
  themes: ["@docusaurus/theme-live-codeblock"],
  presets: [
    [
      "classic",
      {
        docs: {
          sidebarPath: "./sidebars.ts",
          routeBasePath: "docs",
          // 设置文档目录结构
          path: "docs",
          // 添加文档版本控制（可选）
          // versions: {
          //   current: {
          //     label: "当前版本",
          //     path: "",
          //   },
          // },
          beforeDefaultRemarkPlugins: [
            [remarkMDX, {
              // 全局注册组件
              jsx: true,
              providerImportSource: '@theme',
              globalComponents: {
                Tabs: '@theme/Tabs',
                TabItem: '@theme/TabItem'
              }
            }]
          ],
          remarkPlugins: [remarkMDX],
          rehypePlugins: [],
          // 添加 MDX 配置
          mdx1Compat: {
            comments: false,
            admonitions: true,
            headingIds: true,
          },
        },
        blog: {
          showReadingTime: true,
          feedOptions: {
            type: ["rss", "atom"],
            xslt: true,
          },
          // Please change this to your repo.
          // Remove this to remove the "edit this page" links.
          // editUrl:
          //   "https://github.com/facebook/docusaurus/tree/main/packages/create-docusaurus/templates/shared/",
          // Useful options to enforce blogging best practices
          onInlineTags: "warn",
          onInlineAuthors: "warn",
          onUntruncatedBlogPosts: "warn",
        },
        theme: {
          customCss: "./src/css/custom.css",
        },
      } satisfies Preset.Options,
    ],
  ],
  themeConfig: {
    // Replace with your project's social card
    image: "img/docusaurus-social-card.jpg",
    // 告示
    announcementBar: {
      id: "support_us",
      content:
        'We are looking to revamp our docs, please fill <a target="_blank" rel="noopener noreferrer" href="#">this survey</a>',
      backgroundColor: "#fafbfc",
      textColor: "#091E42",
      isCloseable: false,
    },
    docs: {
      versionPersistence: "localStorage",
      sidebar: {
        hideable: false,
        autoCollapseCategories: true,
      },
    },
    tableOfContents: {
      minHeadingLevel: 2,
      maxHeadingLevel: 4,
    },
    colorMode: {
      defaultMode: "light",
      disableSwitch: false,
      respectPrefersColorScheme: true,
    },
    navbar: {
      title: "Ink World",
      logo: {
        alt: "My Site Logo",
        src: "img/logo.svg",
      },
      hideOnScroll: true,
      items: [
        {
          type: "localeDropdown",
          position: "right",
        },
        {
          type: "search",
          position: "right",
        },
        {
          type: "docSidebar",
          sidebarId: "tutorialSidebar",
          position: "left",
          label: "Tutorial",
        },
        {
          type: "docSidebar",
          sidebarId: "databaseSidebar",
          position: "left",
          label: "数据库",
        },
        // { to: "/blog", label: "Blog", position: "left" },
        {
          href: "/friendLink",
          label: "友链",
          position: "right",
        },
        {
          href: "/about",
          label: "关于",
          position: "right",
        },
        {
          href: "https://github.com/ink-kai",
          label: "GitHub",
          position: "right",
        },
      ],
    },
    footer: {
      // style: "dark",
      links: [
        {
          title: "Docs",
          items: [
            {
              label: "Docusaurus",
              href: "https://docusaurus.io",
            },
            {
              label: "Docusaurus Intro",
              to: "/docs/docusaurus/intro",
            },
            {
              label: "Building Tutorial",
              to: "/docs/website/intro",
            },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} By Ink-kai. All rights reserved.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
      additionalLanguages: ["powershell", "bash"],
    },
    plugins: [],
  } satisfies Preset.ThemeConfig,
};

export default config;
