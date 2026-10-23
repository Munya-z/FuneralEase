FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

COPY ["src/FuneralEase.Api/FuneralEase.Api.csproj", "src/FuneralEase.Api/"]
COPY ["src/FuneralEase.Application/FuneralEase.Application.csproj", "src/FuneralEase.Application/"]
COPY ["src/FuneralEase.Domain/FuneralEase.Domain.csproj", "src/FuneralEase.Domain/"]
COPY ["src/FuneralEase.Infrastructure/FuneralEase.Infrastructure.csproj", "src/FuneralEase.Infrastructure/"]

RUN dotnet restore "src/FuneralEase.Api/FuneralEase.Api.csproj"

COPY . .
RUN dotnet publish "src/FuneralEase.Api/FuneralEase.Api.csproj" -c Release -o /app/publish

FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS runtime
WORKDIR /app
EXPOSE 8080
COPY --from=build /app/publish .
ENTRYPOINT ["dotnet", "FuneralEase.Api.dll"]
