import React, { useState } from "react";
import { CalculatorOutlined, HomeOutlined } from "@ant-design/icons";
import { Menu } from "antd";
import Sider from "antd/es/layout/Sider";
import { ReactComponent as SplitwiseIcon } from "../styles/splitwise-icon.svg";

const SideMenu = ({ onMenuClick }) => {
  const [collapsed, setCollapsed] = useState(true);
  const toggleCollapsed = () => {
    setCollapsed(!collapsed);
  };
  const items = [
    {
      key: "1",
      icon: <HomeOutlined />,
      label: "Dashboard",
      onClick: () => onMenuClick("dashboard"),
    },
    {
      key: "2",
      icon: (
        <span>
          <SplitwiseIcon />
        </span>
      ),
      label: "Splitwise Data",
      onClick: () => onMenuClick("splitwise"),
    },
    {
      key: "3",
      icon: <CalculatorOutlined />,
      label: "Budgets",
      onClick: () => onMenuClick("budgets"),
    },
    // {
    //   key: "sub1",
    //   label: "Navigation One",
    //   icon: <MailOutlined />,
    //   children: [
    //     {
    //       key: "5",
    //       label: "Option 5",
    //     },
    //     {
    //       key: "6",
    //       label: "Option 6",
    //     },
    //     {
    //       key: "7",
    //       label: "Option 7",
    //     },
    //     {
    //       key: "8",
    //       label: "Option 8",
    //     },
    //   ],
    // },
  ];

  return (
    <Sider
      collapsible
      collapsed={collapsed}
      onCollapse={(value) => setCollapsed(value)}
    >
      <div className="demo-logo-vertical" />
      <Menu
        theme="dark"
        defaultSelectedKeys={["1"]}
        mode="inline"
        items={items}
      />
    </Sider>
  );
};
export default SideMenu;
