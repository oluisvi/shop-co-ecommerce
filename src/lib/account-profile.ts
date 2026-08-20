export type ProfileUpdateInput = {
  firstName: string;
  lastName: string;
  phone: string;
};

export function buildProfileUpdate(input: ProfileUpdateInput) {
  const optional = (value: string) => value.trim() || undefined;
  return {
    firstName: optional(input.firstName),
    lastName: optional(input.lastName),
    phone: input.phone.trim() || null,
  };
}
