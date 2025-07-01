import { BadgeBase } from ".";

export default {
  title: "Components/BadgeBase",
  component: BadgeBase,
  argTypes: {
    icon: {
      options: ["icon-right", "country", "only", "avatar", "false", "dot", "icon-left", "x-close"],
      control: { type: "select" },
    },
  },
};

export const Default = {
  args: {
    icon: "icon-right",
    className: {},
    textClassName: {},
    text: "Label",
  },
};
