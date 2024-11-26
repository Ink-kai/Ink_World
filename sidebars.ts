import type {SidebarsConfig} from '@docusaurus/plugin-content-docs';

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

/**
 * Creating a sidebar enables you to:
 - create an ordered group of docs
 - render a sidebar for each doc of that group
 - provide next/previous navigation

 The sidebars can be generated from the filesystem, or explicitly defined here.

 Create as many sidebars as you want.
 */
const sidebars: SidebarsConfig = {
  // By default, Docusaurus generates a sidebar from the docs folder structure
  tutorialSidebar: [{type: 'autogenerated', dirName: 'docusaurus'}],
  databaseSidebar: [
    {
      type: 'category',
      label: '数据库优化',
      items: [
        {
          type: 'doc',
          id: 'database/optimization/optimization-overview',
        },
        {
          type: 'category',
          label: '优化系列',
          items: [
            'database/optimization/index-optimization',
            'database/optimization/query-optimization',
            'database/optimization/transaction-optimization',
            'database/optimization/lock-optimization',
          ],
        },
      ],
    },
  ],
  // But you can create a sidebar manually
  /*
  tutorialSidebar: [
    'intro',
    'hello',
    {
      type: 'category',
      label: 'Tutorial',
      items: ['tutorial-basics/create-a-document'],
    },
  ],
   */
};

export default sidebars;
