import { useEffect, useState } from 'react';
import { fetchCitizenById, fetchAllDocuments } from './api';

const PROFILE_KEY = 'citizenProfile';

export const useCitizenProfile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const savedProfile = localStorage.getItem(PROFILE_KEY);
    if (!savedProfile) {
      setLoading(false);
      return;
    }

    const parsed = JSON.parse(savedProfile);
    if (!parsed?.entityId) {
      setProfile(parsed);
      setLoading(false);
      return;
    }

    fetchCitizenById(parsed.entityId)
      .then((freshProfile) => {
        setProfile(freshProfile);
        localStorage.setItem(PROFILE_KEY, JSON.stringify(freshProfile));
      })
      .catch((fetchError) => {
        console.error('Failed to load citizen profile:', fetchError);
        setProfile(parsed);
        setError(fetchError);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  return { profile, loading, error };
};

export const useCitizenDocuments = (entityId) => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!entityId) {
      setDocuments([]);
      setLoading(false);
      return;
    }

    fetchAllDocuments()
      .then((allDocuments) => {
        setDocuments(allDocuments.filter((doc) => doc.entityId === entityId));
      })
      .catch((fetchError) => {
        console.error('Failed to load documents:', fetchError);
        setError(fetchError);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [entityId]);

  return { documents, loading, error, setDocuments };
};
