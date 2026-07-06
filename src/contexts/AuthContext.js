'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { onAuthChange, checkActivation, checkAdmin } from '@/lib/auth';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

const AuthContext = createContext({});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isActivated, setIsActivated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthChange(async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        
        // Fetch user data from Firestore
        try {
          const userRef = doc(db, 'users', firebaseUser.uid);
          const userSnap = await getDoc(userRef);
          
          if (userSnap.exists()) {
            const data = userSnap.data();
            
            let finalRole = data.role;
            let finalActivated = data.activated;

            // Auto-upgrade developer email to Admin & Activated (BULLETPROOF)
            if (firebaseUser.email && firebaseUser.email.toLowerCase() === 'sigapsayangibu@gmail.com') {
              finalRole = 'admin';
              finalActivated = true;
              
              if (data.role !== 'admin' || !data.activated) {
                import('firebase/firestore').then(({ updateDoc }) => {
                  updateDoc(userRef, { role: 'admin', activated: true }).catch(() => {});
                });
              }
            }

            setUserData({ ...data, role: finalRole, activated: finalActivated });
            setIsActivated(finalActivated === true);
            setIsAdmin(finalRole === 'admin');
          } else {
            // Document might not exist yet due to race condition with signInWithGoogle
            // Let's create it here if it doesn't exist
            const isDeveloper = firebaseUser.email === 'sigapsayangibu@gmail.com';
            const newData = {
              uid: firebaseUser.uid,
              name: firebaseUser.displayName || '',
              email: firebaseUser.email,
              photoURL: firebaseUser.photoURL || '',
              activated: isDeveloper,
              activationCode: null,
              activationDate: isDeveloper ? new Date() : null,
              role: isDeveloper ? 'admin' : 'user',
            };
            
            import('firebase/firestore').then(({ setDoc, serverTimestamp }) => {
              setDoc(userRef, { ...newData, createdAt: serverTimestamp() });
            });

            setUserData(newData);
            setIsActivated(newData.activated);
            setIsAdmin(newData.role === 'admin');
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
          // If Firestore is offline or fails, force allow the developer email so they are not locked out
          if (firebaseUser.email && firebaseUser.email.toLowerCase() === 'sigapsayangibu@gmail.com') {
            setUserData({
              uid: firebaseUser.uid,
              name: firebaseUser.displayName || 'Developer',
              email: firebaseUser.email,
              role: 'admin',
              activated: true,
            });
            setIsActivated(true);
            setIsAdmin(true);
          } else {
            setUserData(null);
            setIsActivated(false);
            setIsAdmin(false);
          }
        }
      } else {
        setUser(null);
        setUserData(null);
        setIsActivated(false);
        setIsAdmin(false);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const refreshUserData = async () => {
    if (user) {
      const userRef = doc(db, 'users', user.uid);
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        const data = userSnap.data();
        let finalRole = data.role;
        let finalActivated = data.activated;

        if (user.email && user.email.toLowerCase() === 'sigapsayangibu@gmail.com') {
          finalRole = 'admin';
          finalActivated = true;
        }

        setUserData({ ...data, role: finalRole, activated: finalActivated });
        setIsActivated(finalActivated === true);
        setIsAdmin(finalRole === 'admin');
      }
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        userData,
        loading,
        isActivated,
        isAdmin,
        refreshUserData,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
