"use client"
import React, { useState } from 'react';
import { useRouter } from 'next/navigation'
import Dashboard from './Dashboard';
import Users from './Users';
import Settings from './Settings';
import ToastAlert from './controls/Alerts/ToastAlert';
import LoadingAlert from './controls/Alerts/LoadingAlert';
import ConfirmationProvider from './providers/ConfirmationContext';
import ConfirmationWrapper from './wrappers/ConfirmationWrapper';
import LoadingProvider from './providers/LoadingContext';
import { TabGroup, TabList, Tab, TabPanels, TabPanel } from "@tremor/react";
import { useUser } from '@auth0/nextjs-auth0/client';
import { HiOutlineArrowRightOnRectangle, HiArrowLeftOnRectangle } from "react-icons/hi2";
import { Watch } from 'react-loader-spinner'
import "./globals.css";

const Tabs = ({ setLoadingState }) => {
  return (
    <TabGroup>
      <TabList className="tabs">
        <Tab>
          <div className='flex'>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path fill-rule="evenodd" clip-rule="evenodd" d="M2.5 3C1.67157 3 1 3.67157 1 4.5V8.5C1 9.32843 1.67157 10 2.5 10H8.5C9.32843 10 10 9.32843 10 8.5V4.5C10 3.67157 9.32843 3 8.5 3H2.5ZM13.5 5C12.6716 5 12 5.67157 12 6.5V13.5C12 14.3284 12.6716 15 13.5 15H17.5C18.3284 15 19 14.3284 19 13.5V6.5C19 5.67157 18.3284 5 17.5 5H13.5ZM3.5 12C2.67157 12 2 12.6716 2 13.5V15.5C2 16.3284 2.67157 17 3.5 17H9.5C10.3284 17 11 16.3284 11 15.5V13.5C11 12.6716 10.3284 12 9.5 12H3.5Z" fill="currentColor" />
            </svg>
            <label className='px-3' style={{ "cursor": "pointer" }}>Dashboard</label>
          </div>
        </Tab>
        <Tab>
          <div className='flex'>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M7 8C8.65685 8 10 6.65685 10 5C10 3.34315 8.65685 2 7 2C5.34315 2 4 3.34315 4 5C4 6.65685 5.34315 8 7 8Z" fill="currentColor" />
              <path d="M14.5 9C15.8807 9 17 7.88071 17 6.5C17 5.11929 15.8807 4 14.5 4C13.1193 4 12 5.11929 12 6.5C12 7.88071 13.1193 9 14.5 9Z" fill="currentColor" />
              <path d="M1.61528 16.428C1.21798 16.1736 0.987847 15.721 1.04605 15.2529C1.41416 12.292 3.93944 10 6.9999 10C10.0604 10 12.5856 12.2914 12.9537 15.2522C13.012 15.7203 12.7818 16.1729 12.3845 16.4273C10.8302 17.4225 8.98243 18 6.9999 18C5.01737 18 3.16959 17.4231 1.61528 16.428Z" fill="currentColor" />
              <path d="M14.5001 16C14.4647 16 14.4295 15.9998 14.3943 15.9993C14.4631 15.7025 14.4822 15.3885 14.4423 15.0671C14.2668 13.6562 13.7001 12.367 12.854 11.3116C13.3646 11.1105 13.9208 11 14.5028 11C16.4426 11 18.0956 12.2273 18.7279 13.9478C18.8638 14.3176 18.7045 14.7241 18.3671 14.9275C17.2379 15.6083 15.9147 16 14.5001 16Z" fill="currentColor" />
            </svg>
            <label className='px-3' style={{ "cursor": "pointer" }}>Pacientes</label>
          </div>
        </Tab>
        <Tab>
          <div className='flex'>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path fill-rule="evenodd" clip-rule="evenodd" d="M7.83922 1.80388C7.9327 1.33646 8.34312 1 8.8198 1H11.1802C11.6569 1 12.0673 1.33646 12.1608 1.80388L12.4913 3.45629C13.1956 3.72458 13.8454 4.10332 14.4196 4.57133L16.0179 4.03065C16.4694 3.8779 16.966 4.06509 17.2043 4.47791L18.3845 6.52207C18.6229 6.93489 18.5367 7.45855 18.1786 7.77322L16.9119 8.88645C16.9699 9.24909 17 9.62103 17 10C17 10.379 16.9699 10.7509 16.9119 11.1135L18.1786 12.2268C18.5367 12.5414 18.6229 13.0651 18.3845 13.4779L17.2043 15.5221C16.966 15.9349 16.4694 16.1221 16.0179 15.9693L14.4196 15.4287C13.8454 15.8967 13.1956 16.2754 12.4913 16.5437L12.1608 18.1961C12.0673 18.6635 11.6569 19 11.1802 19H8.8198C8.34312 19 7.9327 18.6635 7.83922 18.1961L7.50874 16.5437C6.80442 16.2754 6.1546 15.8967 5.58042 15.4287L3.98213 15.9694C3.53059 16.1221 3.034 15.9349 2.79566 15.5221L1.61546 13.4779C1.37712 13.0651 1.4633 12.5415 1.82136 12.2268L3.08808 11.1135C3.03011 10.7509 2.99999 10.379 2.99999 10C2.99999 9.62103 3.03011 9.2491 3.08808 8.88647L1.82136 7.77324C1.4633 7.45857 1.37712 6.93491 1.61546 6.52209L2.79566 4.47793C3.034 4.06511 3.53059 3.87791 3.98213 4.03066L5.58041 4.57134C6.15459 4.10332 6.80442 3.72459 7.50874 3.45629L7.83922 1.80388ZM9.99999 13C11.6568 13 13 11.6569 13 10C13 8.34315 11.6568 7 9.99999 7C8.34314 7 6.99999 8.34315 6.99999 10C6.99999 11.6569 8.34314 13 9.99999 13Z" fill="currentColor" />
            </svg>
            <label className='px-3' style={{ "cursor": "pointer" }}>Configuración</label>
          </div>
        </Tab>
      </TabList>
      <TabPanels className="content">
        <TabPanel when="dashboard">
          <Dashboard setLoadingState={setLoadingState} />
        </TabPanel>
        <TabPanel when="users">
          <Users />
        </TabPanel>
        <TabPanel when="results">
          <Settings />
        </TabPanel>
      </TabPanels>
    </TabGroup>
  );
};
const Menu = ({ user, setLoadingState }) => {

  const isAdmin = user.roles && user.roles.includes('SYMFARMIA-Admin');
  return (
    <div className="container px-1 mx-auto my-5 font-sans">
      <div className="flex items-center my-5 space-x-4 flex-col lg:flex-row justify-between">
        <div className="w-28">
          <img src="/images/symfarmia.png" alt="Logo Image" className="mx-auto my-auto" />
        </div>
        <div className="flex-1">
          <div className="text-gray-700 text-xl lg:text-2xl font-normal leading-7 lg:leading-10">
            {user ? `Bienvenid@, Dr. ${user.name}` : "Favor de ingresar para ver el contenido."}
          </div>          

          <div className="text-gray-500 text-base lg:text-xl font-normal leading-5 lg:leading-7">
            {isAdmin ? (
              <div>
                Panel de administración
              </div>
            ) : (
              <div>
                Por favor, solicite al administrador que le asigne el rol de 'SYMFARMIA-Admin' para acceder a este panel.
              </div>
            )}
          </div>
        </div>
        <div className="w-28 lg:w-auto my-auto" style={{ alignSelf: 'flex-end' }}>
          {user ? (
            <a href='/api/auth/logout' className="text-gray-500 hover:text-blue-700 flex items-center focus:outline-none">
              Salir
              <HiOutlineArrowRightOnRectangle className="mx-1 w-6 h-6" />
            </a>
          ) : (
            <a href='/api/auth/login' className="text-gray-500 hover:text-blue-700 flex items-center focus:outline-none">
              Login
              <HiMiniArrowLeftOnRectangle className="mx-1 w-6 h-6" />
            </a>
          )}
        </div>
      </div>

      {user ? (
        isAdmin && <Tabs setLoadingState={setLoadingState} />
      ) : (
        <NotFound />
      )}

      <span className="text-gray-500 text-sm px-2">
SYMFARMIA® App v1.0.1
      </span>
    </div>
  );
};
const NotFound = () => {
  return (
    <div className="bg-gray-100 min-h-screen flex items-center justify-center">
      <div className="bg-white p-8 rounded shadow-md">
        <h2 className="text-3xl font-semibold text-gray-800 mb-4">Usuario no ha ingresado</h2>
        <p className="text-gray-600 text-lg">
          Asegurése de que su usuario tiene permisos de administrador, dando click en el botón para login.
        </p>
      </div>
    </div>
  );
};

const RedirectComponent = () => {
  const router = useRouter();

  React.useEffect(() => {
    router.push("/api/auth/login");
  }, [router]);

  return null;
};

const App = () => {
  const { user, isLoading } = useUser();

  let roles = [];

  if (user) {
    // Find the key that ends with 'roles'
    const rolesKey = Object.keys(user).find(key => key.endsWith('roles'));
    if (rolesKey) {
      roles = user[rolesKey];
    }
    user.roles = roles;
  }

  const [loadingState, setLoadingState] = useState(false);


  return (
    <ConfirmationProvider>
      <ConfirmationWrapper>
        <LoadingProvider>
          {(isLoading || loadingState) && (
            <div className="fixed inset-0 bg-gray-100 bg-opacity-100 flex items-center justify-center z-50">
              <Watch
                height="80"
                width="80"
                radius="48"
                color="#4fa94d"
                ariaLabel="watch-loading"
                wrapperStyle={{}}
                wrapperClassName=""
                visible={true}
              />
            </div>
          )}

          {user ? (
            <Menu isLoading={isLoading} user={user} setLoadingState={setLoadingState}></Menu>
          ) : (
            !isLoading && <RedirectComponent />
          )}
          <ToastAlert />
          <LoadingAlert />
        </LoadingProvider>
      </ConfirmationWrapper>
    </ConfirmationProvider>
  );
};


export default App;