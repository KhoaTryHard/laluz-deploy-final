// lib/account.js

export function updateProfile(data) {
  // sau này thay bằng fetch API thật
  console.log("UPDATE PROFILE:", data);

  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ success: true });
    }, 800);
  });
}

export function uploadAvatar(file) {
  return new Promise((resolve) => {
    const reader = new FileReader();

    reader.onload = () => {
      resolve(reader.result); // base64 preview
    };

    reader.readAsDataURL(file);
  });
}
