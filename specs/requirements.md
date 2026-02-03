# Requirements Document - Sát Vách Platform

## Introduction

Sát Vách là một nền tảng chia sẻ thông tin địa điểm (location information sharing platform) với cách tiếp cận "Map-First", được thiết kế để kết nối cộng đồng đô thị tại Việt Nam, đặc biệt là các siêu đô thị như TP.HCM. Hệ thống cho phép người dùng đóng góp thông tin về các địa điểm (quán ăn, cửa hàng, dịch vụ) trên bản đồ, giúp người khác tìm kiếm và khám phá các địa điểm xung quanh một cách nhanh chóng. Platform được thiết kế để scale và hỗ trợ hàng nghìn người dùng đồng thời với chi phí vận hành tối ưu.

## Glossary

- **System**: Hệ thống Sát Vách bao gồm frontend, backend, database, storage, và các services liên quan  
- **User**: Người dùng có thể đóng góp thông tin địa điểm (có thể ẩn danh hoặc đã đăng ký)
- **Location**: Một địa điểm được đóng góp bởi user (quán ăn, cửa hàng, dịch vụ, v.v.)
- **Map_Component**: Thành phần bản đồ tương tác sử dụng MapLibre GL JS
- **Backend_API**: API server sử dụng FastAPI
- **Database**: PostgreSQL database với PostGIS extension
- **Storage_Service**: MinIO S3-compatible object storage cho ảnh địa điểm
- **Spatial_Query**: Truy vấn dựa trên vị trí địa lý sử dụng PostGIS
- **Radius_Search**: Tìm kiếm locations trong bán kính từ một điểm
- **Vector_Tiles**: Dữ liệu bản đồ dạng vector từ Maptiler
- **Geolocation**: Tọa độ địa lý (latitude, longitude)
- **Category**: Loại hình địa điểm (quán ăn, cửa hàng, dịch vụ, giải trí, v.v.)
- **Marker**: Biểu tượng hiển thị location trên bản đồ
- **Admin_Panel**: Giao diện quản trị để moderators xem xét và quản lý nội dung
- **Moderator**: Người dùng có quyền xem xét, phê duyệt, hoặc xóa locations

## Requirements

### Requirement 1: Interactive Map Display

**User Story:** Là một user, tôi muốn xem bản đồ tương tác với vector tiles, để tôi có thể khám phá khu vực xung quanh và tìm kiếm địa điểm theo vị trí.

#### Acceptance Criteria

1. WHEN the application loads, THE Map_Component SHALL display an interactive map centered on Ho Chi Minh City or Hanoi
2. WHEN a user interacts with the map, THE Map_Component SHALL support pan, zoom, and rotate operations
3. THE Map_Component SHALL render vector tiles from Maptiler within the 100k loads/month free tier limit
4. WHEN the map is displayed, THE Map_Component SHALL show the user's current location if geolocation permission is granted
5. THE Map_Component SHALL be responsive and functional on both mobile and desktop devices

### Requirement 2: Location Contribution

**User Story:** Là một user, tôi muốn đóng góp thông tin về địa điểm, để tôi có thể chia sẻ với cộng đồng về các quán ăn, cửa hàng, dịch vụ xung quanh.

#### Acceptance Criteria

1. WHEN a user contributes a location, THE System SHALL require name, description, category, and geolocation
2. WHEN a user submits location data, THE Backend_API SHALL validate all required fields before storing
3. WHEN a location is created, THE Database SHALL store the location with spatial data using PostGIS geometry type
4. WHEN a user contributes a location, THE System SHALL allow uploading up to 5 images per location
5. WHEN location data is invalid, THE Backend_API SHALL return descriptive error messages with field-specific validation failures

### Requirement 3: Image Upload and Storage

**User Story:** Là một user, tôi muốn upload ảnh địa điểm khi đóng góp thông tin, để người khác có thể xem hình ảnh chi tiết của địa điểm.

#### Acceptance Criteria

1. WHEN a user uploads an image, THE System SHALL accept JPEG, PNG, and WebP formats with maximum size of 5MB per image
2. WHEN an image is uploaded, THE Backend_API SHALL store it in the Storage_Service with a unique identifier
3. WHEN an image is stored, THE Database SHALL save the image URL reference associated with the location
4. WHEN image upload fails, THE System SHALL provide clear error messages and maintain application state
5. WHEN a location is deleted, THE System SHALL remove associated images from the Storage_Service

### Requirement 4: Spatial Search and Filtering

**User Story:** Là một user, tôi muốn tìm kiếm địa điểm trong bán kính xung quanh vị trí của tôi, để tôi có thể tìm thấy quán ăn, cửa hàng, dịch vụ gần nhất.

#### Acceptance Criteria

1. WHEN a user performs a search, THE Backend_API SHALL execute a Spatial_Query to find locations within the specified radius
2. WHEN executing a Radius_Search, THE System SHALL support radius values from 500 meters to 50 kilometers
3. WHEN locations are found, THE Backend_API SHALL return results sorted by distance from the search center point
4. WHEN a user filters by category, THE Spatial_Query SHALL include category constraints in addition to spatial constraints
5. THE Spatial_Query SHALL use PostGIS spatial indexes for performance optimization

### Requirement 5: Map-Based Location Visualization

**User Story:** Là một user, tôi muốn xem địa điểm được hiển thị trên bản đồ dưới dạng markers, để tôi có thể dễ dàng nhận biết vị trí và phân bố của các địa điểm.

#### Acceptance Criteria

1. WHEN locations are loaded, THE Map_Component SHALL display markers at the geolocation of each location
2. WHEN a user clicks on a marker, THE System SHALL display location details including name, description, category, and thumbnail image
3. WHEN multiple locations are close together, THE Map_Component SHALL cluster markers to avoid visual clutter
4. WHEN the map viewport changes, THE System SHALL load and display only locations visible in the current viewport plus a buffer zone
5. WHEN location data updates, THE Map_Component SHALL refresh markers without requiring a full page reload

### Requirement 6: User Location Services

**User Story:** Là một user, tôi muốn hệ thống xác định vị trí hiện tại của tôi, để tôi có thể dễ dàng đóng góp thông tin và tìm kiếm địa điểm xung quanh.

#### Acceptance Criteria

1. WHEN the application requests location, THE System SHALL use browser Geolocation API to obtain user coordinates
2. WHEN geolocation permission is denied, THE System SHALL default to a predefined city center location
3. WHEN contributing a location, THE System SHALL allow users to either use current location or manually select a location on the map
4. WHEN a user manually selects a location, THE Map_Component SHALL place a draggable marker that updates coordinates in real-time
5. THE System SHALL store geolocation data with precision of at least 6 decimal places for accuracy

### Requirement 7: API Data Models and Validation

**User Story:** Là một developer, tôi muốn có data models rõ ràng và validation chặt chẽ, để đảm bảo tính toàn vẹn dữ liệu và dễ dàng maintain.

#### Acceptance Criteria

1. THE Backend_API SHALL define SQLAlchemy models for all database entities with proper type annotations
2. WHEN data is received, THE Backend_API SHALL validate input using Pydantic schemas before processing
3. THE Database SHALL enforce NOT NULL constraints on required fields at the database level
4. THE Database SHALL use PostGIS geometry type for all spatial data columns
5. WHEN database schema changes, THE System SHALL use Alembic migrations to version and apply changes

### Requirement 8: Performance and Scalability

**User Story:** Là một user, tôi muốn hệ thống phản hồi nhanh và ổn định, để tôi có thể có trải nghiệm sử dụng mượt mà.

#### Acceptance Criteria

1. WHEN executing a Spatial_Query, THE Database SHALL use spatial indexes to return results within 500ms for queries with up to 100,000 locations
2. WHEN loading the map, THE System SHALL implement lazy loading to fetch only visible locations
3. WHEN images are displayed, THE System SHALL serve optimized thumbnails for list views and full images for detail views
4. THE Backend_API SHALL implement connection pooling for database connections to handle concurrent requests
5. THE System SHALL support at least 500 concurrent users without performance degradation

### Requirement 9: Location Detail View

**User Story:** Là một user, tôi muốn xem thông tin chi tiết của địa điểm, để tôi có thể biết đầy đủ thông tin trước khi quyết định đến địa điểm đó.

#### Acceptance Criteria

1. WHEN a user views location details, THE System SHALL display name, description, category, address, and all uploaded images
2. WHEN viewing location details, THE System SHALL display the location on an embedded map
3. WHEN viewing location details, THE System SHALL show the distance from the user's current location
4. THE System SHALL allow users to view full-size images in a gallery view
5. WHEN no images are available, THE System SHALL display a default placeholder image

### Requirement 10: Category Management

**User Story:** Là một user, tôi muốn lọc địa điểm theo loại hình, để tôi có thể nhanh chóng tìm thấy loại địa điểm tôi quan tâm.

#### Acceptance Criteria

1. THE System SHALL support predefined categories: Food & Drink, Shopping, Services, Entertainment, Healthcare, Education, Other
2. WHEN a user contributes a location, THE System SHALL require selecting exactly one category
3. WHEN a user filters by category, THE System SHALL display only locations matching the selected category
4. THE System SHALL display category icons on map markers for visual identification
5. THE System SHALL allow users to view all available categories in a browsable list

### Requirement 11: Text Search

**User Story:** Là một user, tôi muốn tìm kiếm địa điểm theo tên hoặc mô tả, để tôi có thể nhanh chóng tìm thấy địa điểm tôi quan tâm.

#### Acceptance Criteria

1. WHEN a user enters search text, THE System SHALL search location names and descriptions using PostgreSQL full-text search
2. WHEN search results are returned, THE System SHALL highlight matching text in the results
3. THE System SHALL support Vietnamese text search with proper diacritics handling
4. WHEN combining text search with spatial search, THE System SHALL apply both filters
5. WHEN no results are found, THE System SHALL display a helpful message

### Requirement 12: Error Handling and Resilience

**User Story:** Là một user, tôi muốn hệ thống xử lý lỗi một cách graceful, để tôi luôn biết điều gì đang xảy ra và có thể tiếp tục sử dụng.

#### Acceptance Criteria

1. WHEN an API error occurs, THE Backend_API SHALL return standardized error responses with HTTP status codes and error messages
2. WHEN the Storage_Service is unavailable, THE System SHALL queue image uploads and retry with exponential backoff
3. WHEN the Database connection fails, THE Backend_API SHALL return a 503 Service Unavailable status with retry-after header
4. WHEN client-side errors occur, THE System SHALL display user-friendly error messages without exposing technical details
5. THE System SHALL log all errors with sufficient context for debugging while protecting sensitive user data

### Requirement 13: Deployment and Configuration

**User Story:** Là một developer, tôi muốn hệ thống dễ dàng deploy và configure, để tôi có thể nhanh chóng triển khai và maintain production environment.

#### Acceptance Criteria

1. THE System SHALL use Docker Compose to orchestrate all services (postgres, minio, backend, frontend)
2. WHEN deploying, THE System SHALL load configuration from environment variables for all sensitive credentials
3. THE System SHALL expose the application through Cloudflare Tunnel for secure public access
4. WHEN the database initializes, THE System SHALL automatically run init.sql to create required extensions and tables
5. THE System SHALL include health check endpoints for all services to monitor system status

### Requirement 14: Responsive UI Design

**User Story:** Là một user, tôi muốn giao diện hoạt động tốt trên cả mobile và desktop, để tôi có thể sử dụng ứng dụng trên bất kỳ thiết bị nào.

#### Acceptance Criteria

1. WHEN viewed on mobile devices, THE System SHALL display a mobile-optimized layout with touch-friendly controls
2. WHEN viewed on desktop, THE System SHALL utilize available screen space with a multi-column layout
3. THE Map_Component SHALL adjust controls and zoom levels appropriately for the device screen size
4. WHEN the viewport size changes, THE System SHALL respond dynamically without requiring page reload
5. THE System SHALL use TailwindCSS and Flowbite components to ensure consistent responsive behavior

### Requirement 15: Security and Data Protection

**User Story:** Là một user, tôi muốn dữ liệu được bảo vệ, để tôi có thể yên tâm sử dụng nền tảng.

#### Acceptance Criteria

1. THE System SHALL use HTTPS for all client-server communications
2. THE System SHALL implement CORS policies to prevent unauthorized cross-origin requests
3. THE System SHALL sanitize all user inputs to prevent SQL injection and XSS attacks
4. THE System SHALL implement rate limiting on API endpoints to prevent abuse (100 requests per minute per IP)
5. THE System SHALL log security events for monitoring and audit purposes

### Requirement 16: API Documentation

**User Story:** Là một developer, tôi muốn có API documentation đầy đủ, để tôi có thể dễ dàng integrate và maintain.

#### Acceptance Criteria

1. THE Backend_API SHALL automatically generate OpenAPI (Swagger) documentation from code annotations
2. THE System SHALL serve interactive API documentation at /docs endpoint
3. THE Backend_API SHALL implement API versioning using URL path prefix (e.g., /api/v1/)
4. THE System SHALL document all request/response schemas, error codes, and validation requirements
5. WHEN API changes are made, THE System SHALL update documentation automatically

### Requirement 17: Logging and Monitoring

**User Story:** Là một developer, tôi muốn có logging đầy đủ, để tôi có thể debug issues và monitor system health.

#### Acceptance Criteria

1. THE System SHALL log all API requests with timestamp, endpoint, and response time
2. THE System SHALL use structured logging (JSON format) for easy parsing and analysis
3. THE System SHALL implement different log levels: DEBUG, INFO, WARNING, ERROR, CRITICAL
4. THE System SHALL include health check endpoints for monitoring service status
5. THE System SHALL log errors with sufficient context for debugging

### Requirement 18: Database Migrations

**User Story:** Là một developer, tôi muốn quản lý database schema changes an toàn, để tôi có thể evolve schema mà không làm mất dữ liệu.

#### Acceptance Criteria

1. THE System SHALL use Alembic for managing database migrations with version control
2. WHEN a migration is created, THE System SHALL include both upgrade and downgrade scripts
3. THE System SHALL automatically run pending migrations on application startup in development mode
4. THE System SHALL validate migrations before applying to ensure data integrity
5. THE System SHALL maintain migration history in the database

### Requirement 19: Content Moderation

**User Story:** Là một moderator, tôi muốn xem xét và quản lý các địa điểm được đóng góp, để đảm bảo chất lượng thông tin và loại bỏ nội dung không phù hợp.

#### Acceptance Criteria

1. WHEN a moderator accesses the Admin_Panel, THE System SHALL display a list of all locations with status (pending, approved, rejected)
2. WHEN a moderator reviews a location, THE System SHALL allow actions: approve, reject, or delete
3. WHEN a location is rejected, THE System SHALL remove it from public view but preserve it in the database for audit
4. THE System SHALL allow moderators to search and filter locations by status, category, and date
5. THE Admin_Panel SHALL display location details including all images, contributor information, and submission timestamp

