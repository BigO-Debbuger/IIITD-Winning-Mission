// referloom_frontend/src/hooks/useProfileAccess.js
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

export const useProfileAccess = (targetUserId) => {
  const { user: currentUser } = useAuth();
  const [accessLevel, setAccessLevel] = useState('loading'); // 'loading', 'basic', 'full'
  const [targetProfile, setTargetProfile] = useState(null);

  useEffect(() => {
    const checkAccess = async () => {
      try {
        const response = await api.get(`/users/${targetUserId}`);
        const profile = response.data;
        
        // 1. If viewing own profile -> Full Access
        if (currentUser.id === targetUserId) {
          setAccessLevel('full');
          setTargetProfile(profile);
          return;
        }

        // 2. Logic for Students viewing other Students
        if (currentUser.role === 'student' && profile.role === 'student') {
          setAccessLevel('basic'); // Students only ever see basic profiles of peers
        } 
        
        // 3. Logic for Alumni/Company viewing Students
        else if (['alumni', 'company'].includes(currentUser.role) && profile.role === 'student') {
          // If student is public, or has explicitly granted access to this user
          if (profile.visibilityMode === 'public' || profile.grantedAccess.includes(currentUser.id)) {
            setAccessLevel('full');
          } else {
            setAccessLevel('locked'); // Need to request access or wait for application
          }
        } 
        
        // 4. Default fallback
        else {
          setAccessLevel('basic');
        }

        setTargetProfile(profile);
      } catch (error) {
        console.error("Error fetching profile access", error);
        setAccessLevel('error');
      }
    };

    if (targetUserId) checkAccess();
  }, [currentUser, targetUserId]);

  return { accessLevel, targetProfile };
};