# Queued changes (from the owner)

- Lancelot's seized weapons: the weapons themselves should take on the black-and-red vein colouring (tint the sword, spear and warhammer sprites while `armT > 0`). Right now the red veins (`drawSeizedVeins` in `src/ui/89f-abilities.js`) are drawn at a fixed spot in front of him and don't follow the weapon as it swings. They should be drawn along the weapon itself, using the same grip and rotation as `drawWeapon` (`GRIP`, `putW`), so they move with every swing.
