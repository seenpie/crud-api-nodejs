import { DefaultServerService } from "@/server/default-server.service";
import request from "supertest";
import dotenv from "dotenv";
import { HttpStatusCode } from "@/models/enums";
import { TUser } from "@/models/types";
import { DatabaseService } from "@/db/database.service";
import { createDefaultServer } from "@/helpers/server.helper";

dotenv.config();

let server: DefaultServerService;
const clientUserPayload = { username: "123", age: 123, hobbies: ["sleeping"] };

beforeAll(() => {
  const store: TUser[] = [];
  const dbService = new DatabaseService(store);
  server = createDefaultServer(dbService);
  server.start(process.env.PORT);
});

afterAll(() => {
  server.stop();
});

describe("UserEntity API testing", () => {
  let createdUserId: string;

  test("GET /api/users - should return an empty array", async () => {
    const response = await request(server.getServerInstance()).get(
      "/api/users"
    );
    expect(response.status).toBe(HttpStatusCode.OK);
    expect(response.body).toEqual([]);
  });

  test("POST /api/users - should create a new user", async () => {
    const response = await request(server.getServerInstance())
      .post("/api/users")
      .send(clientUserPayload);

    expect(response.status).toBe(HttpStatusCode.CREATED);
    expect(response.body).toMatchObject(clientUserPayload);
    expect(response.body).toHaveProperty("id");

    createdUserId = response.body.id;
  });

  test("GET /api/users/:userId - should retrieve the created user", async () => {
    const response = await request(server.getServerInstance()).get(
      `/api/users/${createdUserId}`
    );

    expect(response.status).toBe(HttpStatusCode.OK);
    expect(response.body).toHaveProperty("id", createdUserId);
    expect(response.body).toHaveProperty(
      "username",
      clientUserPayload.username
    );
    expect(response.body).toHaveProperty("age", clientUserPayload.age);
    expect(response.body).toHaveProperty("hobbies", clientUserPayload.hobbies);
  });

  test("PUT /api/users/:userId - should update the created user", async () => {
    const updatedUserPayload = {
      username: "321",
      age: 321
    };
    const response = await request(server.getServerInstance())
      .put(`/api/users/${createdUserId}`)
      .send(updatedUserPayload);

    expect(response.status).toBe(HttpStatusCode.OK);
    expect(response.body).toHaveProperty("id", createdUserId);
    expect(response.body).toHaveProperty(
      "username",
      updatedUserPayload.username
    );
    expect(response.body).toHaveProperty("age", updatedUserPayload.age);
  });

  test("DELETE /api/users/:userId - should delete the created user", async () => {
    const response = await request(server.getServerInstance()).delete(
      `/api/users/${createdUserId}`
    );
    expect(response.status).toBe(HttpStatusCode.NO_CONTENT);
  });

  test("GET /api/users/:userId - should return 404 for deleted user", async () => {
    const response = await request(server.getServerInstance()).get(
      `/api/users/${createdUserId}`
    );
    expect(response.status).toBe(HttpStatusCode.NOT_FOUND);
  });
});
