import React from 'react';
import { Sidebar, Menu, MenuItem, useProSidebar, SubMenu } from 'react-pro-sidebar';
import User from '../User/User';
import Icon from '../icons/Icon'

import styles from './BarNav.module.css'


const BarNav = () => {
  const { collapseSidebar, collapsed } = useProSidebar();

  return (
    <div style={{ display: 'flex', height: '100%' }}>
      <Sidebar backgroundColor='#181c32' className='vh-100'>
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>

          {/*****************Header*********************/}

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
                        backgroundColor: '#262d49',
                      },
                    };
                  }
                  if (level === 1) {
                    return {
                      color: disabled ? undefined : '#FFFFFF',
                      backgroundColor: active ? undefined : "#262d49",
                      '&:hover': {
                        backgroundColor: '#3b425b',
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
              <MenuItem icon={<Icon name='dashboard-svgrepo-com' color="#FFFFFF" size={18} />} > Documentation</MenuItem>
              <MenuItem icon={<Icon name='calendar-o' color="#FFFFFF" size={18} />}> Calendar</MenuItem>
              <SubMenu label="Graphs" icon={<Icon name='graph-bar' color="#FFFFFF" size={18} />}>
                <MenuItem> Google maps</MenuItem>
                <MenuItem> Open street maps</MenuItem>
              </SubMenu>
            </Menu>
          </div>
          <div className={`d-flex mb-3 ${collapsed ?'flex-column align-items-center flex-column-auto' : 'flex-row ms-3'}`}
              
          >
            <User />
          </div>
        </div>

      </Sidebar>
      <div>
        <button onClick={() => collapseSidebar()}>Collapse</button>
      </div>
    </div>

  );
}
export default BarNav;