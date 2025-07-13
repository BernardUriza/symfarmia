import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

interface HealthStatus {
  status: 'healthy' | 'unhealthy' | 'degraded';
  timestamp: string;
  version: string;
  environment: string;
  services: {
    database: 'connected' | 'disconnected' | 'error';
    translations: 'complete' | 'incomplete' | 'error';
    build: 'ready' | 'building' | 'error';
  };
  system: {
    nodeVersion: string;
    nextVersion: string;
    uptime: number;
    memory: {
      used: number;
      total: number;
      percentage: number;
    };
  };
  locks: {
    translation: boolean;
  };
  buildInfo: {
    buildTime?: string;
    buildEnv?: string;
    buildId?: string;
  };
}

async function checkDatabase(): Promise<'connected' | 'disconnected' | 'error'> {
  try {
    // Try to import and check Prisma client
    const { PrismaClient } = await import('@prisma/client');
    const prisma = new PrismaClient();
    await prisma.$connect();
    await prisma.$disconnect();
    return 'connected';
  } catch (error) {
    console.error('Database health check failed:', error);
    return 'error';
  }
}

async function checkTranslations(): Promise<'complete' | 'incomplete' | 'error'> {
  try {
    // Check if translation validation script exists
    const translationScript = path.join(process.cwd(), 'scripts', 'revolutionary-translation-validator.js');
    if (!fs.existsSync(translationScript)) {
      return 'error';
    }
    
    // Check if translation files exist
    const translationPaths = [
      path.join(process.cwd(), 'public', 'locales', 'es', 'common.json'),
      path.join(process.cwd(), 'public', 'locales', 'en', 'common.json')
    ];
    
    for (const filePath of translationPaths) {
      if (!fs.existsSync(filePath)) {
        return 'incomplete';
      }
    }
    
    return 'complete';
  } catch (error) {
    console.error('Translation health check failed:', error);
    return 'error';
  }
}

function checkLocks(): { translation: boolean; } {
  const translationLock = fs.existsSync(path.join(process.cwd(), '.translation-lock'));
  
  return {
    translation: translationLock
  };
}

function getMemoryUsage() {
  const memUsage = process.memoryUsage();
  const totalMemory = memUsage.heapTotal + memUsage.external;
  const usedMemory = memUsage.heapUsed;
  
  return {
    used: Math.round(usedMemory / 1024 / 1024), // MB
    total: Math.round(totalMemory / 1024 / 1024), // MB
    percentage: Math.round((usedMemory / totalMemory) * 100)
  };
}

function getSystemInfo() {
  return {
    nodeVersion: process.version,
    nextVersion: getNextVersion(),
    uptime: Math.round(process.uptime()),
    memory: getMemoryUsage()
  };
}

function getNextVersion(): string {
  try {
    const packageJson = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'package.json'), 'utf8'));
    return packageJson.dependencies?.next || packageJson.devDependencies?.next || 'unknown';
  } catch {
    return 'unknown';
  }
}

function getBuildInfo() {
  return {
    buildTime: process.env.BUILD_TIME,
    buildEnv: process.env.BUILD_ENV,
    buildId: process.env.MEDICAL_BUILD_ID
  };
}

export async function GET(): Promise<NextResponse<HealthStatus>> {
  const startTime = Date.now();
  
  try {
    // Run health checks
    const [database, translations] = await Promise.all([
      checkDatabase(),
      checkTranslations()
    ]);
    
    const locks = checkLocks();
    const system = getSystemInfo();
    const buildInfo = getBuildInfo();
    
    // Determine overall health status
    let status: 'healthy' | 'unhealthy' | 'degraded' = 'healthy';
    
    if (database === 'error' || translations === 'error' || locks.translation ) {
      status = 'unhealthy';
    } else if (
      database === 'disconnected' || 
      translations === 'incomplete' || 
      (process.env.NODE_ENV === 'development')
    ) {
      status = 'degraded';
    }
    
    const healthData: HealthStatus = {
      status,
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'unknown',
      services: {
        database,
        translations,
        build: 'ready'
      },
      system,
      locks,
      buildInfo
    };
    
    const responseTime = Date.now() - startTime;
    
    return NextResponse.json(healthData, {
      status: status === 'healthy' ? 200 : status === 'degraded' ? 200 : 503,
      headers: {
        'X-Response-Time': `${responseTime}ms`,
        'X-Health-Status': status,
        'Cache-Control': 'no-cache, no-store, must-revalidate'
      }
    });
    
  } catch (error) {
    console.error('Health check failed:', error);
    
    const errorData: HealthStatus = {
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'unknown',
      services: {
        database: 'error',
        translations: 'error',
        build: 'error'
      },
      system: getSystemInfo(),
      locks: { translation: false },
      buildInfo: getBuildInfo()
    };
    
    return NextResponse.json(errorData, { status: 503 });
  }
}