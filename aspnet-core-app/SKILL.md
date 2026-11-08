---
name: aspnet-core-app
description: Develop, run, and debug ASP.NET Core (.NET / C#) web APIs and apps — Minimal APIs, controllers, dependency injection, Entity Framework Core, Program.cs, and dotnet CLI.
allowed-tools: Bash, Read, Grep, Glob, Edit, Write
---

# ASP.NET Core (.NET / C#) App

ASP.NET Core specifics (C#, cross-platform .NET, Minimal APIs, controllers).

0. **Greenfield Scaffolding**:
   `dotnet new webapi -n <name> -o .` (or `dotnet new web -o .` for minimal web)
   Ensure `.csproj` and `Program.cs` are created at workspace root.

1. **Program.cs & Minimal APIs**:
   ```csharp
   var builder = WebApplication.CreateBuilder(args);
   builder.Services.AddEndpointsApiExplorer();
   builder.Services.AddSwaggerGen();

   var app = builder.Build();

   app.MapGet("/api/health", () => Results.Ok(new { status = "ok" }));
   app.MapGet("/api/items", (IItemService service) => Results.Ok(service.GetAll()));

   app.Run();
   ```

2. **Dependency Injection**:
   - Register services in `builder.Services`:
     - Transient: `builder.Services.AddTransient<IService, Service>()`
     - Scoped: `builder.Services.AddScoped<IRepository, Repository>()`
     - Singleton: `builder.Services.AddSingleton<ICache, Cache>()`

3. **Entity Framework Core**:
   - Register DbContext: `builder.Services.AddDbContext<AppDbContext>(opt => opt.UseSqlite("Data Source=app.db"))`.
   - Migrations: `dotnet ef migrations add InitialCreate` and `dotnet ef database update`.

4. **Configuration & Environment**:
   - `appsettings.json` and `appsettings.Development.json`.
   - Read config with `builder.Configuration.GetSection("MySection")`.

5. **Build, Test & Verify**:
   - Build: `dotnet build`
   - Run tests: `dotnet test`
   - Run app: `dotnet run` (listens on ports specified in `Properties/launchSettings.json` or `ASPNETCORE_URLS`).
   - Curl endpoint: `curl -i http://localhost:5000/api/health`.
