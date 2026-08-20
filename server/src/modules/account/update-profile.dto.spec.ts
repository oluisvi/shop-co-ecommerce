import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { UpdateProfileDto } from './dto/update-profile.dto.js';

async function errorsFor(payload: unknown) {
  return validate(plainToInstance(UpdateProfileDto, payload), {
    whitelist: true,
    forbidNonWhitelisted: true,
  });
}

describe('UpdateProfileDto', () => {
  it('accepts only the intended editable profile fields', async () => {
    await expect(errorsFor({ firstName: ' Luis ', lastName: ' Vieira ', phone: null })).resolves.toHaveLength(0);
  });

  it.each(['id', 'email', 'role', 'createdAt', 'updatedAt'])('rejects privileged field %s', async (field) => {
    const errors = await errorsFor({ firstName: 'Luis', [field]: 'attacker-controlled' });
    expect(errors.some((error) => error.property === field)).toBe(true);
  });

  it('rejects invalid editable values', async () => {
    const errors = await errorsFor({ firstName: 42, phone: 'x'.repeat(31) });
    expect(errors.map((error) => error.property)).toEqual(expect.arrayContaining(['firstName', 'phone']));
  });
});
