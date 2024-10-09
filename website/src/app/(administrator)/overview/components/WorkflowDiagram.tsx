'use client'
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { CloudIcon, BeakerIcon, WrenchIcon, SunIcon, ArrowPathIcon } from '@heroicons/react/24/solid';
import { useTheme } from 'next-themes';

interface Task {
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  title: string;
  description: string;
  recommendations: string[];
  status: 'completed' | 'in_progress' | 'upcoming';
}

type StatusColors = {
  [key in Task['status']]: string;
};

interface SensorNodeProps {
    icon: React.ReactNode;
    title: string;
    description: string;
    color: 'blue' | 'red' | 'yellow' | 'green';
    left: number;
    top: number;
}  

interface AWSDiamondProps {
    textLine1: string;
    textLine2: string;
  }

interface AWSQuickSightProps {
    textLine1: string;
    textLine2: string;
}

type TabType = 'all' | 'soil_moisture' | 'soil_temperature' | 'brightness' | 'air_temperature' | 'air_humidity';

interface TabButtonProps {
  children: React.ReactNode;
  active: boolean;
  onClick: () => void;
}

const TabButton: React.FC<TabButtonProps> = ({ children, active = false, onClick }) => {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-2 text-sm font-medium rounded-md transition-colors duration-150 
      ${active 
        ? 'bg-blue-500 text-black dark:text-white' 
        : 'bg-white dark:bg-gray-800 text-gray-500 hover:bg-white'
      }`}
    >
      {children}
    </button>
  );
};

const WorkflowDiagram = () => {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<TabType>('all');

    const handleTabChange = (tab: TabType) => {
      setActiveTab(tab);
    };

    useEffect(() => {
        const fetchData = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await axios.get('https://lp8vj9qov4.execute-api.us-east-1.amazonaws.com/prod/task-plan');
            const processedTasks = processTasks(response.data);
            setTasks(processedTasks);
        } catch (error) {
            console.error('Error fetching data:', error);
            setError('Failed to load tasks. Please try again later.');
        } finally {
            setIsLoading(false);
        }
        };

        fetchData();
    }, []);

    const processTasks = (data: any[]): Task[] => {
        if (!Array.isArray(data)) {
        console.error('Data is not an array:', data);
        return [];
        }
        const icons = [CloudIcon, BeakerIcon, WrenchIcon, SunIcon, ArrowPathIcon];
        return data.reduce((acc: Task[], item, index) => {
        const content = item.plan.recommendations;
        const activities = extractActivities(content);
        const newTasks = activities.map((activity, activityIndex) => ({
            id: `task-${index}-${activityIndex}`,
            title: 'Moisture Management',
            description: activity,
            status: index === 0 && activityIndex === 0 ? 'in_progress' : 'upcoming',
            icon: icons[index % icons.length],
            recommendations: [`Recomendação padrão para ${activity}`],
        }));
        return [...acc, ...newTasks];
        }, []);
    };

    const extractActivities = (content: string | string[]): string[] => {
        if (Array.isArray(content)) {
        return content.filter(activity => activity !== '');
        }
        return content.split('\n-').slice(1).map(activity => activity.trim()).filter(activity => activity !== '');
    };

    if (isLoading) return <div className="text-center p-4">Carregando tarefas...</div>;
    if (error) return <div className="text-center p-4 text-red-500">{error}</div>;
      
      const getStatusText = (status: Task['status']): string => {
        switch (status) {
          case 'completed': return 'Concluído';
          case 'in_progress': return 'Em andamento';
          case 'upcoming': return 'Próxima tarefa';
          default: return 'Status desconhecido';
        }
      };

      const TaskNode: React.FC<{ task: Task }> = ({ task }) => {
        const { theme } = useTheme();
        const IconComponent = task.icon;
      
        const getStatusColor = (status: Task['status']): string => {
          const baseColors: StatusColors = {
            completed: 'text-green-500',
            in_progress: 'text-blue-500',
            upcoming: 'text-yellow-500'
          };
          const darkColors: StatusColors = {
            completed: 'text-green-400',
            in_progress: 'text-blue-400',
            upcoming: 'text-yellow-400'
          };
          return theme === 'dark' ? darkColors[status] : baseColors[status];
        };
      
        const getStatusText = (status: Task['status']): string => {
          const statusTexts: StatusColors = {
            completed: 'Concluído',
            in_progress: 'Em andamento',
            upcoming: 'Próximo'
          };
          return statusTexts[status];
        };
      
        return (
          <div className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg p-4 w-full max-w-md">
            <div className="flex items-center mb-2">
              <IconComponent className="w-5 h-5 mr-2 text-blue-500 dark:text-blue-400" />
              <h3 className="font-semibold text-gray-800 dark:text-gray-200">{task.title}</h3>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{task.description}</p>
            <div className="bg-blue-100 dark:bg-blue-800 rounded p-2 mt-2">
              <h4 className="font-semibold text-xs mb-1 text-gray-800 dark:text-gray-200">Recomendação:</h4>
              <p className="text-xs text-gray-600 dark:text-gray-400">{task.recommendations[0]}</p>
            </div>
            <div className={`mt-2 text-xs font-semibold ${getStatusColor(task.status)}`}>
              {getStatusText(task.status)}
            </div>
          </div>
        );
      };

      const VerticalArrow: React.FC = () => (
        <svg className="w-6 h-6 text-gray-400 my-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
        </svg>
      );

      const StatusBox: React.FC<{ label: string; value: number; lightColor: string; darkColor: string }> = ({ label, value, lightColor, darkColor }) => {
        const { theme } = useTheme();
        
        return (
          <div className={`${theme === 'dark' ? darkColor : lightColor} rounded-lg p-2 text-center`}>
            <span className="block text-2xl font-bold">{value}</span>
            <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>{label}</span>
          </div>
        );
      };
      
      const StatusBar: React.FC<{ tasks: Task[] }> = ({ tasks }) => {
        return (
          <div className="flex justify-end space-x-4 mb-6">
            <StatusBox 
              label="Total" 
              value={tasks.length} 
              lightColor="bg-blue-100" 
              darkColor="bg-blue-800"
            />
            <StatusBox 
              label="Completed" 
              value={tasks.filter(t => t.status === 'completed').length} 
              lightColor="bg-green-100" 
              darkColor="bg-green-800"
            />
            <StatusBox 
              label="Upcoming" 
              value={tasks.filter(t => t.status === 'upcoming').length} 
              lightColor="bg-yellow-100" 
              darkColor="bg-yellow-800"
            />
            <StatusBox 
              label="In Progress" 
              value={tasks.filter(t => t.status === 'in_progress').length} 
              lightColor="bg-purple-100" 
              darkColor="bg-purple-800"
            />
          </div>
        );
      };

      const AlexaNode: React.FC<{ x: string, y: string }> = ({ x, y }) => (
        <div className={`absolute ${x} ${y} transform -translate-x-1/2 rounded-lg shadow-md hover:shadow-md transition-all duration-300 hover:-translate-y-1`}>
          <div className="bg-[#00CAFF] rounded-lg p-3 w-32 h-32 flex items-center justify-center shadow-lg">
            <div className="text-center">
              <svg className="w-16 h-16 text-black dark:text-white mb-2 mx-auto" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/>
                <path d="M12 6c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6-2.69-6-6-6zm0 10c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4z"/>
                <circle cx="12" cy="12" r="2"/>
              </svg>
              <span className="font-semibold text-black dark:text-white text-center text-xs">Integração Alexa</span>
            </div>
          </div>
        </div>
      )

      const SensorNode: React.FC<SensorNodeProps> = ({ icon, title, description, color, left, top }) => {
        const { theme } = useTheme();
      
        return (
          <div style={{ position: 'absolute', left: `${left}px`, top: `${top}px`, transform: 'translateX(-50%)' }}>
            <div className={`bg-white dark:bg-gray-800 border-2 border-${color}-300 dark:border-${color}-700 rounded-lg p-4 w-52 shadow-lg hover:shadow-xl transition-shadow duration-300`}>
              <div className="flex items-center">
                <div className={`bg-${color}-100 dark:bg-${color}-800 rounded-full p-2 mr-3`}>
                  {icon}
                </div>
                <div>
                  <div className={`font-semibold ${theme === 'dark' ? 'text-gray-200' : 'text-gray-800'}`}>{title}</div>
                  <div className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{description}</div>
                </div>
              </div>
            </div>
          </div>
        );
      };     
      
      const MoistureIcon: React.FC = () => (
        <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
        </svg>
      )
      
      const TemperatureIcon: React.FC = () => (
        <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      )
      
      const BrightnessIcon: React.FC = () => (
        <svg className="h-6 w-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      )
      
      const HumidityIcon: React.FC = () => (
        <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
        </svg>
      )   
      
      const AWSDiamond: React.FC<AWSDiamondProps> = ({ textLine1, textLine2 }) => {
        return (
          <div className="relative w-32 h-32 transform rotate-45 bg-gradient-to-br from-orange-200 to-orange-300 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <div className="absolute inset-0 flex flex-col items-center justify-center transform -rotate-45">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 80 80"
                className="w-12 h-12 text-orange-600 mb-1"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                {/* AWS-like smile */}
                <path d="M20,50 Q40,60 60,50" strokeWidth="4" />
                
                {/* Integration circles */}
                <circle cx="20" cy="30" r="10" />
                <circle cx="60" cy="30" r="10" />
                
                {/* Connection lines */}
                <path d="M30,30 L50,30" strokeWidth="3" />
                <path d="M20,40 L20,50" strokeWidth="3" />
                <path d="M60,40 L60,50" strokeWidth="3" />
                
                {/* Arrow */}
                <path d="M40,10 L40,25 M35,20 L40,25 L45,20" strokeWidth="3" />
              </svg>
              <div className="flex flex-col items-center">
                <span className="font-semibold text-orange-800 text-center text-xs">{textLine1}</span>
                <span className="font-semibold text-orange-800 text-center text-xs">{textLine2}</span>
              </div>
            </div>
          </div>
        );
      };

      const AWSQuickSight: React.FC<AWSQuickSightProps> = ({ textLine1, textLine2 }) => {
        return (
          <div className="relative w-32 h-32 transform rotate-45 bg-gradient-to-br from-blue-200 to-blue-300 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <div className="absolute inset-0 flex flex-col items-center justify-center transform -rotate-45">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 80 80"
                className="w-12 h-12 text-blue-600 mb-1"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                {/* Chart icon */}
                <rect x="10" y="30" width="15" height="40" />
                <rect x="32" y="10" width="15" height="60" />
                <rect x="54" y="20" width="15" height="50" />
                
                {/* Magnifying glass */}
                <circle cx="60" cy="20" r="8" />
                <line x1="65" y1="25" x2="75" y2="35" />
              </svg>
              <div className="flex flex-col items-center">
                <span className="font-semibold text-blue-800 text-center text-xs">{textLine1}</span>
                <span className="font-semibold text-blue-800 text-center text-xs">{textLine2}</span>
              </div>
            </div>
          </div>
        );
      };
      
  return (
    <div className="bg-white dark:bg-gray-800 p-4 font-sans mt-20 rounded-md">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 h-[4300px]">
        <div className="flex flex-col mb-8">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold">Plano de tarefas Agrícola</h1>
              <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
              </svg>
            </div>
          </div>
          <div className="flex justify-between items-center">
            <div className="flex space-x-2">
              <TabButton 
                active={activeTab === 'all'} 
                onClick={() => handleTabChange('all')}
              >
                Todas
              </TabButton>
              <TabButton 
                active={activeTab === 'soil_moisture'} 
                onClick={() => handleTabChange('soil_moisture')}
              >
                Umidade Solo
              </TabButton>
              <TabButton 
                active={activeTab === 'soil_temperature'} 
                onClick={() => handleTabChange('soil_temperature')}
              >
                Temp. Solo
              </TabButton>
              <TabButton 
                active={activeTab === 'brightness'} 
                onClick={() => handleTabChange('brightness')}
              >
                Luminosidade
              </TabButton>
              <TabButton 
                active={activeTab === 'air_temperature'} 
                onClick={() => handleTabChange('air_temperature')}
              >
                Temp. Ar
              </TabButton>
              <TabButton 
                active={activeTab === 'air_humidity'} 
                onClick={() => handleTabChange('air_humidity')}
              >
                Umidade Ar
              </TabButton>
            </div>
            <StatusBar tasks={tasks} />
          </div>
        </div>
        
        <div className="relative">
          {/* Background grid */}
          <div className="absolute inset-0 h-[4050px]" style={{
            backgroundImage: 'radial-gradient(circle, #d1d5db 1px, transparent 1px)',
            backgroundSize: '20px 20px'
          }}></div>

          {/* Start node */}
          <div className="absolute left-1/2 top-4 transform -translate-x-1/2">
            <div className="text-md mb-1 text-center">Iniciar</div>
            <div className="bg-green-400 rounded-full w-10 h-10 flex items-center justify-center">
                <svg className="w-6 h-6 text-black dark:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                </svg>
            </div>
          </div>

          <div className="relative w-full bg-gray-50">
            <SensorNode 
                icon={<MoistureIcon />}
                title="Sensor de Umidade do Solo"
                description="Verifica a Umidade do Solo"
                color="blue"
                left={150}
                top={180}
            />
            <SensorNode 
                icon={<TemperatureIcon />}
                title="Sensor de Temperatura do Solo"
                description="Verifica a Temperatura do Solo"
                color="red"
                left={450}
                top={180}
            />
            <SensorNode 
                icon={<BrightnessIcon />}
                title="Sensor de Luminosidade"
                description="Verifica a Luminosidade"
                color="yellow"
                left={750}
                top={180}
            />
            <SensorNode 
                icon={<TemperatureIcon />}
                title="Sensor de Temperatura do Ar"
                description="Verifica a Temperatura do Ar"
                color="red"
                left={1050}
                top={180}
            />
            <SensorNode 
                icon={<HumidityIcon />}
                title="Sensor de Umidade do Ar"
                description="Verifica a Umidade do Ar"
                color="green"
                left={1350}
                top={180}
            />
        </div>

          {/* AWS Infraestructure node */}
          <div className="absolute left-1/2 top-[400px] transform -translate-x-1/2">
                <div className="text-center">
                    <AWSDiamond textLine1="Integração" textLine2="AWS" />
                </div>
            </div>

          {/* CARDS nodes */}
          <div className="absolute grid grid-cols-3 w-full top-[700px] space-y-20">
          {tasks.map((task, index) => (
            <React.Fragment key={task.id}>
                <TaskNode task={task} />
                {index < tasks.length - 1 && <VerticalArrow />}
                {/* Check submit node */}
                {/* Top */}
                <AlexaNode x="left-[725px]" y="top-[50px]"/>
                {/* Left */}
                <AlexaNode x="right-3/4" y="top-[350px]"/>
                {/* Right */}
                <AlexaNode x="left-[1220px]" y="top-[350px]"/>
                {/* Top */}
                <AlexaNode x="left-[725px]" y="top-[650px]"/>
                {/* Left */}
                <AlexaNode x="right-3/4" y="top-[925px]"/>
                {/* Right */}
                <AlexaNode x="left-[1220px]" y="top-[925px]"/>
                {/* Top */}
                <AlexaNode x="left-[725px]" y="top-[1250px]"/>
                {/* Left */}
                <AlexaNode x="right-3/4" y="top-[1550px]"/>
                {/* Right */}
                <AlexaNode x="left-[1220px]" y="top-[1550px]"/>
                {/* Top */}
                <AlexaNode x="left-[725px]" y="top-[1850px]"/>
                {/* Left */}
                <AlexaNode x="right-3/4" y="top-[2150px]"/>
                {/* Right */}
                <AlexaNode x="left-[1220px]" y="top-[2150px]"/>
                {/* Bottom */}
                <AlexaNode x="left-[725px]" y="top-[2450px]"/>
            </React.Fragment>
            ))}
          </div>

          <div className="absolute left-1/2 top-[650px] transform -translate-x-1/2">
            <div className="bg-white dark:bg-gray-800 border rounded-lg p-3 w-48 shadow-md">
              <div className="flex items-center">
                <div className="bg-green-100 rounded-full p-1 mr-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div>
                  <div className="font-semibold">Trigger</div>
                  <div className="text-xs text-gray-500">Configuração de Integração com a Alexa</div>
                </div>
              </div>
            </div>
          </div>

          {/* AWS integration (New activities) node */}
          <div className="absolute left-1/2 top-[3500px] transform -translate-x-1/2">
            <AWSDiamond textLine1="Integração" textLine2="AWS" />
          </div>

          {/* AWSQuickSight Relatórios de tarefas do mês node */}
          <div className="absolute left-[490px] top-[3700px] transform -translate-x-1/2">
            <AWSQuickSight textLine1="AWS" textLine2="QuickSight (Relatórios)" />
          </div>

          {/* AWSQuickSight Relatórios de novas tarefas do mês node */}
          <div className="absolute left-[1030px] top-[3700px] transform -translate-x-1/2">
            <AWSQuickSight textLine1="AWS" textLine2="QuickSight (Relatórios)" />
          </div>

          {/* Email nodes */}
          <div className="absolute left-1/4 top-[3950px]">
            <div className="bg-white dark:bg-gray-800 border rounded-lg p-3 w-48 shadow-md">
              <div className="flex items-center">
                <div className="bg-green-100 rounded-full p-1 mr-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <div className="font-semibold">Email</div>
                  <div className="text-xs text-gray-500">Envio de um relatório das tarefas do mês</div>
                </div>
              </div>
            </div>
          </div>

          <div className="absolute right-1/4 top-[3950px]">
            <div className="bg-white dark:bg-gray-800 border rounded-lg p-3 w-48 shadow-md">
              <div className="flex items-center">
                <div className="bg-green-100 rounded-full p-1 mr-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <div className="font-semibold">Email</div>
                  <div className="text-xs text-gray-500">Envio e alerta de novas tarefas do mês</div>
                </div>
              </div>
            </div>
          </div>

          {/* Connector lines */}
          {/* Start to Sensors lines */}
          <svg className="absolute -top-20 left-36 w-full h-full" style={{zIndex: 1}}>
            {/* Connector lines */}
            <path d="M 600,200 L 600,140" stroke="#008000" strokeWidth="2" fill="none" />
            
            {/* Initial soil moisture line */}
            <path d="M 600,200 L 180,100" stroke="#1E90FF" strokeWidth="2" fill="none" />

            {/* Final soil moisture line */}
            <path d="M 40,240 L 180,100" stroke="#1E90FF" strokeWidth="2" fill="none" />
            
            {/* Soil temperature line */}
            <path d="M 600,200 L 300,240" stroke="#FF0000" strokeWidth="2" fill="none" />

            {/* Brightness line */}
            <path d="M 600,200 L 600,240" stroke="#FFD700" strokeWidth="2" fill="none" />
            
            {/* Air temperature line */}
            <path d="M 600,200 L 900,240" stroke="#FF0000" strokeWidth="2" fill="none" />

            {/* Initial soil moisture line */}
            <path d="M 600,200 L 950,100" stroke="#1E90FF" strokeWidth="2" fill="none" />

            {/* Final soil moisture line */}
            <path d="M 1200,240 L 950,100" stroke="#1E90FF" strokeWidth="2" fill="none" />
          </svg>

          {/* Webhook to Submit Check line */}
          <svg className="absolute top-40 left-36 w-full h-full" style={{zIndex: 1}}>
            <path d="M 600,60 L 600,140" stroke="#008000" strokeWidth="2" fill="none" />
          </svg>

          {/* Submit Check to triggers lines */}
          <svg className="absolute top-80 left-36 w-full h-full" style={{zIndex: 1}}>
            <path d="M 600,200 L 600,140" stroke="#008000" strokeWidth="2" fill="none" />
            <path d="M 600,200 L 300,280" stroke="#008000" strokeWidth="2" fill="none" />
            <path d="M 600,200 L 600,280" stroke="#008000" strokeWidth="2" fill="none" />
            <path d="M 600,200 L 900,280" stroke="#008000" strokeWidth="2" fill="none" />
          </svg>

          {/* Triggers to left email line */}
          <svg className="absolute top-[2600px] right-32 w-full h-full" style={{zIndex: 1}}>
            <path d="M 600,60 L 600,140" stroke="#008000" strokeWidth="2" fill="none" />
          </svg>

          {/* Triggers to right email line */}
          <svg className="absolute top-[2610px] left-[415px] w-full h-full" style={{zIndex: 1}}>
            <path d="M 600,60 L 600,140" stroke="#008000" strokeWidth="2" fill="none" />
          </svg>

          {/* Left email to event transform line */}
          <svg className="absolute top-[2710px] right-[400px] w-full h-full" style={{zIndex: 1}}>
            <path d="M 1100,270 L 960,120" stroke="#008000" strokeWidth="2" fill="none" />
          </svg>

          {/* Event transform to check submit line */}
          <svg className="absolute top-[2900px] left-[550px] w-full h-full" style={{zIndex: 1}}>
            <path d="M 10,200 L 140,100" stroke="#008000" strokeWidth="2" fill="none" />
          </svg>

          {/* Check submit to http request line */}
          <svg className="absolute top-[3010px] right-[400px] w-full h-full" style={{zIndex: 1}}>
            <path d="M 1100,270 L 960,120" stroke="#008000" strokeWidth="2" fill="none" />
          </svg>

        </div>
      </div>
    </div>
  );
};

export default WorkflowDiagram;