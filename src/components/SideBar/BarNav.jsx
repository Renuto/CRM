import React from 'react';
import { Sidebar, Menu, MenuItem, useProSidebar, SubMenu } from 'react-pro-sidebar';
import Button from 'react-bootstrap/Button';
import HeaderBar from './HeaderBar';
import User from '../User/User';
import Icon from '../assets/media/icons/Icon'

import styles from './BarNav.module.css'


const BarNav = () => {
  const { collapseSidebar, collapsed } = useProSidebar();

  return (
    <div style={{ display: 'flex', height: '100%' }}>
      <Sidebar backgroundColor='#174d99' className='vh-100'>
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>

          {/*****************Header*********************/}
          <HeaderBar isCollapse={collapsed}/>
          <div style={{ flex: 1 }}>
            <Menu className={styles['aside-primary']}
              menuItemStyles={{
                button: ({ level, active, disabled }) => {
                  // only apply styles on first level elements of the tree
                  if (level === 0) {
                    return {
                      color: disabled ? '#f5d9ff' : '#FFFFFF',
                      backgroundColor: active ? '#eecef9' : undefined,
                      '&:hover': {
                        backgroundColor: '#416e9f',
                      },
                    };
                  }
                  if (level === 1) {
                    return {
                      color: disabled ? undefined : '#FFFFFF',
                      backgroundColor: active ? undefined : "#9bb2d3",
                      '&:hover': {
                        backgroundColor: '#416e9f',
                      },
                    };
                  }
                },
              }}
            >
              <MenuItem icon={<Icon name='dashboard-svgrepo-com' color="#FFFFFF" size={18} />} > Documentation</MenuItem>
              <MenuItem icon={<Icon name='calendar-o' color="#FFFFFF" size={18} />}> Calendar</MenuItem>
              <SubMenu label="Graphs" icon={<Icon name='graph-bar' color="#FFFFFF" size={18} />}>
                <MenuItem> Google maps</MenuItem>
                <MenuItem> Open street maps</MenuItem>
              </SubMenu>
              <MenuItem icon={<Icon name='dashboard-svgrepo-com' color="#FFFFFF" size={18} />} > Documentation</MenuItem>
              <MenuItem icon={<Icon name='calendar-o' color="#FFFFFF" size={18} />}> Calendar</MenuItem>
              <SubMenu label="Graphs" icon={<Icon name='graph-bar' color="#FFFFFF" size={18} />}>
                <MenuItem> Google maps</MenuItem>
                <MenuItem> Open street maps</MenuItem>
              </SubMenu>
            </Menu>
          </div>
          <div className={`d-flex mb-3 ${collapsed ? 'flex-column align-items-center flex-column-auto' : 'flex-row ms-3 mt-3'}`}

          >
            <User />
          </div>
        </div>

      </Sidebar>
      <div className='mt-2 ms-2'>
        <Button variant="light" className="d-flex align-items-center" onClick={() => collapseSidebar()}>
          {!collapsed ? <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-arrow-left" viewBox="0 0 16 16">
            <path fill-rule="evenodd" d="M15 8a.5.5 0 0 0-.5-.5H2.707l3.147-3.146a.5.5 0 1 0-.708-.708l-4 4a.5.5 0 0 0 0 .708l4 4a.5.5 0 0 0 .708-.708L2.707 8.5H14.5A.5.5 0 0 0 15 8z" />
          </svg> :
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-arrow-right" viewBox="0 0 16 16">
              <path fill-rule="evenodd" d="M1 8a.5.5 0 0 1 .5-.5h11.793l-3.147-3.146a.5.5 0 0 1 .708-.708l4 4a.5.5 0 0 1 0 .708l-4 4a.5.5 0 0 1-.708-.708L13.293 8.5H1.5A.5.5 0 0 1 1 8z" />
            </svg>}
        </Button>
      </div>
    </div>

  );
}
export default BarNav;