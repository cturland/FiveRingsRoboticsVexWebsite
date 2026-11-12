import 'server-only';

import { randomUUID } from 'node:crypto';
import type { SupabaseClient } from '@supabase/supabase-js';
import { getSupabaseTeamProfileBucket } from '@/lib/supabase/env';
import { TEAM_PROFILE_ROLE_OPTIONS, type TeamProfileRole } from './teamProfileConstants';
import { normalizeRoles } from './teamProfiles';

const MAX_PHOTO_SIZE = 5 * 1024 * 1024;
const DEFAULT_IMAGE_EXTENSION = 'jpg';
const MAX_BIO_WORDS = 100;

export type TeamProfilePayload = {
  email: string;
  name: string;
  photo_path: string;
  roles: TeamProfileRole[];
  bio: string;
  is_current_member: boolean;
};

export type TeamProfileFormValues = {
  email: string;
  name: string;
  bio: string;
  isCurrentMember: boolean;
  roles: TeamProfileRole[];
  currentPhotoPath: string | null;
  photo: File | null;
};

export type TeamProfileValidationResult =
  | {
      ok: true;
      values: TeamProfileFormValues;
    }
  | {
      ok: false;
      message: string;
    };

export function parseTeamProfileFormData(formData: FormData, email: string, currentPhotoPath: string | null): TeamProfileValidationResult {
  const name = String(formData.get('name') ?? '').trim();
  const bio = String(formData.get('bio') ?? '').trim();
  const isCurrentMember = formData.get('isCurrentMember') === 'on';
  const selectedRoles = normalizeRoles(formData.getAll('roles'));
  const photoValue = formData.get('photo');
  const photo = photoValue instanceof File && photoValue.size > 0 ? photoValue : null;

  if (!name) {
    return {
      ok: false,
      message: 'Please enter a name before saving the profile.',
    };
  }

  if (selectedRoles.length === 0) {
    return {
      ok: false,
      message: 'Choose at least one role for the team profile.',
    };
  }

  if (selectedRoles.length !== new Set(selectedRoles).size) {
    return {
      ok: false,
      message: 'Each selected role should only appear once.',
    };
  }

  const invalidRoles = selectedRoles.filter((role) => !TEAM_PROFILE_ROLE_OPTIONS.includes(role));
  if (invalidRoles.length > 0) {
    return {
      ok: false,
      message: 'One or more selected roles are not allowed. Please reselect the roles.',
    };
  }

  if (!bio) {
    return {
      ok: false,
      message: 'Please add a short bio before saving the profile.',
    };
  }

  if (countWords(bio) > MAX_BIO_WORDS) {
    return {
      ok: false,
      message: 'The bio is a little too long. Please keep it to 100 words or fewer.',
    };
  }

  if (!currentPhotoPath && !photo) {
    return {
      ok: false,
      message: 'Please upload a profile photo before saving the profile.',
    };
  }

  if (photo) {
    if (!photo.type.startsWith('image/')) {
      return {
        ok: false,
        message: 'The selected profile file is not an image. Please upload a photo instead.',
      };
    }

    if (photo.size > MAX_PHOTO_SIZE) {
      return {
        ok: false,
        message: 'This profile photo is larger than 5 MB. Choose a smaller image and try again.',
      };
    }
  }

  return {
    ok: true,
    values: {
      email: email.trim().toLowerCase(),
      name,
      bio,
      isCurrentMember,
      roles: selectedRoles,
      currentPhotoPath,
      photo,
    },
  };
}

export async function uploadTeamProfilePhoto(
  supabase: SupabaseClient,
  values: TeamProfileFormValues,
  userId: string,
): Promise<{ ok: true; photoPath: string } | { ok: false; message: string }> {
  if (!values.photo) {
    if (values.currentPhotoPath) {
      return { ok: true, photoPath: values.currentPhotoPath };
    }

    return {
      ok: false,
      message: 'Please upload a profile photo before saving the profile.',
    };
  }

  const bucket = getSupabaseTeamProfileBucket();
  const extension = getSafeExtension(values.photo);
  const storagePath = [userId, randomUUID() + '.' + extension].join('/');
  const bytes = Buffer.from(await values.photo.arrayBuffer());

  const { error: uploadError } = await supabase.storage.from(bucket).upload(storagePath, bytes, {
    contentType: values.photo.type,
    upsert: false,
  });

  if (uploadError) {
    console.error('Team profile photo upload failed:', uploadError);
    return {
      ok: false,
      message: `Saving the profile photo failed: ${uploadError.message}. Make sure the team profile bucket and policies are set up.`,
    };
  }

  return {
    ok: true,
    photoPath: storagePath,
  };
}

export function buildTeamProfilePayload(values: TeamProfileFormValues, photoPath: string): TeamProfilePayload {
  return {
    email: values.email,
    name: values.name,
    photo_path: photoPath,
    roles: values.roles,
    bio: values.bio,
    is_current_member: values.isCurrentMember,
  };
}

export async function deleteTeamProfilePhoto(supabase: SupabaseClient, photoPath: string | null | undefined) {
  if (!photoPath) {
    return;
  }

  const { error } = await supabase.storage.from(getSupabaseTeamProfileBucket()).remove([photoPath]);
  if (error) console.error('Failed to remove an old profile photo:', error);
}

function getSafeExtension(file: File) {
  const fileNameParts = file.name.split('.');
  const originalExtension = fileNameParts.length > 1 ? fileNameParts[fileNameParts.length - 1] : '';
  const cleanedOriginal = originalExtension.toLowerCase().replace(/[^a-z0-9]/g, '');

  if (cleanedOriginal) {
    return cleanedOriginal;
  }

  const mimeSubtype = file.type.split('/')[1] ?? DEFAULT_IMAGE_EXTENSION;
  const cleanedSubtype = mimeSubtype.toLowerCase().replace(/[^a-z0-9]/g, '');
  return cleanedSubtype || DEFAULT_IMAGE_EXTENSION;
}


function countWords(value: string) {
  const normalized = value.trim();

  if (!normalized) {
    return 0;
  }

  return normalized.split(/\s+/).length;
}
