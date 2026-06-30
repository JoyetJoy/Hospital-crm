import React, { useState } from 'react';
import { Layout, Menu, Button, Dropdown, Avatar, Drawer, Grid } from 'antd';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../../store/slices/authSlice';
import { DashboardOutlined, BankOutlined, ScheduleOutlined, FileDoneOutlined, FileTextOutlined, AppstoreOutlined, TeamOutlined, LogoutOutlined, UserOutlined, MenuFoldOutlined, MenuUnfoldOutlined } from '@ant-design/icons';
const {
  Header,
  Sider,
  Content
} = Layout;
const {
  useBreakpoint
} = Grid;
const MainLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const user = useSelector(state => state.auth.user);
  const screens = useBreakpoint();
  const isMobile = screens.md === false;
  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };
  const menuItems = [{
    key: '/hospitals',
    icon: <BankOutlined />,
    label: 'Hospitals'
  }, {
    key: '/visits',
    icon: <ScheduleOutlined />,
    label: 'Visits'
  }, {
    key: '/followups',
    icon: <FileDoneOutlined />,
    label: 'Follow-ups'
  }, {
    key: '/quotations',
    icon: <FileTextOutlined />,
    label: 'Quotations'
  }];
  if (user?.role === 'Super Admin' || user?.role === 'Admin' || user?.role === 'Manager') {
    menuItems.unshift({
      key: '/dashboard',
      icon: <DashboardOutlined />,
      label: 'Dashboard'
    });
  }
  
  if (user?.role === 'Super Admin' || user?.role === 'Admin') {
    menuItems.push({
      key: '/executives',
      icon: <TeamOutlined />,
      label: 'Executives'
    });
  }
  const userMenu = {
    items: [{
      key: 'profile',
      icon: <UserOutlined />,
      label: 'Profile'
    }, {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Logout',
      onClick: handleLogout
    }]
  };
  const handleMenuClick = ({
    key
  }) => {
    navigate(key);
    if (isMobile) {
      setDrawerVisible(false);
    }
  };
  const renderMenu = () => <Menu theme="dark" mode="inline" selectedKeys={[location.pathname]} items={menuItems} onClick={handleMenuClick} />;
  return <Layout style={{
    minHeight: '100vh'
  }}>
      {!isMobile ? <Sider trigger={null} collapsible collapsed={collapsed} width={200}>
          <div style={{
        height: 64,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white',
        fontSize: 20,
        fontWeight: 'bold',
        letterSpacing: 1
      }}>
            {collapsed ? 'CRM' : 'MedCRM Pro'}
          </div>
          {renderMenu()}
        </Sider> : <Drawer title={<span style={{
      color: 'white',
      fontSize: 20,
      fontWeight: 'bold',
      letterSpacing: 1
    }}>MedCRM Pro</span>} placement="left" onClose={() => setDrawerVisible(false)} open={drawerVisible} styles={{
      header: {
        backgroundColor: '#111827',
        borderBottom: '1px solid rgba(255,255,255,0.1)',
        padding: '16px 24px'
      },
      body: {
        padding: 0,
        backgroundColor: '#111827'
      }
    }} closeIcon={<span style={{
      color: 'white'
    }}>✕</span>} width={200}>
          {renderMenu()}
        </Drawer>}
      <Layout>
        <Header style={{
        padding: isMobile ? '0 16px' : '0 24px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
          <Button type="text" icon={isMobile ? <MenuUnfoldOutlined /> : collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />} onClick={() => isMobile ? setDrawerVisible(true) : setCollapsed(!collapsed)} style={{
          fontSize: '16px',
          width: 64,
          height: 64,
          padding: isMobile ? '0' : undefined
        }} />
          <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: isMobile ? '8px' : '16px'
        }}>
            {!isMobile && <span style={{
            fontWeight: 500
          }}>{user?.firstName} {user?.lastName} ({user?.role})</span>}
            <Dropdown menu={userMenu} placement="bottomRight">
              <Avatar style={{
              backgroundColor: '#4F46E5',
              cursor: 'pointer'
            }} icon={<UserOutlined />} />
            </Dropdown>
          </div>
        </Header>
        <Content style={{
        margin: isMobile ? '16px' : '24px',
        minHeight: 280
      }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>;
};
export default MainLayout;