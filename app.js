import { createAuthService } from "./js/services/AuthService.js";
import { HttpClient } from "./js/http/HttpClient.js";
import { UserDemoService } from "./js/services/UserDemoService.js";
import { CategoriaService } from "./js/services/CategoriaService.js";
import { UserDemoGridComponent } from "./js/components/UserDemoGrid-component.js";

function notify(type, title, message) {
  console.log(`[${type}] ${title} - ${message}`);
}

document.addEventListener("DOMContentLoaded", async () => {
  const API_BASE = "https://p4edev.ipolisboa.min-saude.pt/APIS/P4ECOREAPI";

  const auth = createAuthService(API_BASE, {
    username: "P4ECORETESTE",
    password: "p4ecore_teste",
  });

  await auth.ensureToken();

  const http = new HttpClient(API_BASE);

  const userService = new UserDemoService(http);
  const categoriaService = new CategoriaService(http);


  const userGrid = new UserDemoGridComponent(
    userService,
    categoriaService,
    "userDemoGrid",
    notify,
  );

  await userGrid.init();
});
