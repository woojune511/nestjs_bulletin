## 사용한 기술
Node.js, Nest.js, TypeORM, TypeScript, MySQL

## Authentication
- 이메일, 패스워드로 로그인
- JWT 토큰 인증 (로그인하거나 토큰을 refresh할 때 쿠키에 자동으로 저장됨)
- Access Token, Refresh Token

## User
- 이메일, 성, 이름, 프로필 사진
- 다른 유저의 프로필 조회 가능 (이메일은 조회 불가능)
- 자신의 프로필 조회, 수정 가능 (이메일은 수정 불가능)
- 자신이 작성한 글, 댓글 목록 조회 가능

## Space (게시판)
- 개설 시, 이름, 로고, 역할 설정 가능
- 유저는 자신이 참여 중인 공간 목록 조회 가능
- 관리자용, 참여자용 초대 코드를 통해 공간에 참여 가능

## SpaceRole
- 관리자용 역할, 참여자용 역할 존재
- 관리자는 역할을 새로 추가하거나 삭제할 수 있고, 다른 유저의 역할 변경 가능
    (관리자의 역할은 공간의 소유자만 변경 가능)

## Post
- 게시글 목록 조회 가능
- 게시글 등록 가능
- 관리자는 공지글 작성 가능
- 관리자와 작성자는 게시글 삭제 가능
- 공간에 참여 중인 사용자는 익명글 게시 가능
- 익명글의 작성자는 작성자 본인과 관리자만 확인 가능
- 게시글 작성자의 댓글을 제외한 댓글 수가 가장 많은 5개 글은 인기글이 됨
- 댓글 수가 같은 경우에는 댓글에 참여한 유저 수로 결정

## Chat (댓글)
- 게시글에 댓글 작성 가능
- 댓글에 답글 작성 가능
- 관리자와 작성자는 댓글 삭제 가능
- 공간에 참여 중인 사용자는 익명으로 댓글 작성 가능
- 익명 댓글의 작성자는 작성자 본인과 관리자만 확인 가능


## ER diagram
![ER diagram] (./ERdiagram.png)

## API Specification
#### /auth
- POST /auth/login
    - Request body example
        - {
            "email": "JohnDoe@gmail.com",
            "password": "0000"
        }
    - Response example
        - {
            "message": "login success",
            "access_token": "(access token)",
            "refresh_token": "(refresh token)"
        }
    - HTTP status code
        - 201 Created

- GET /auth/refresh  
    - Response example
        - {
            "newAccessToken": "{new access token}"
        }
    - HTTP status code
        - 200 OK

- GET /auth/logout
    - Response example
        - {
            "message": "logout success"
        }
    - HTTP status code
        - 200 OK

#### /user
- POST /user/signup
    - Request body example
        - {
            "email": "JohnDoe@gmail.com",
            "first_name": "John",
            "last_name": "Doe",
            "password": "0000",
            "profile_pic": (image file, optional)
        }
    - Response example
        - {
            "profile_pic": "(randomly generated file name)",
            "email": "JohnDoe@gmail.com",
            "first_name": "John",
            "last_name": "Doe",
            "password": "0000"
        }
    - HTTP status code
        - 201 Created

- GET /user/:id
    - Parameter
        - id: number

    - Response example
        - {
            "id": 1,
            "email": "JohnDoe@gmail.com",
            "first_name": "John",
            "last_name": "Doe"
        }
    - HTTP status code
        - 200 OK

- PATCH /user/:id
    - Parameter
        - id: number
    
    - Request body example
        - {
            "first_name": "(new first name)",
            "last_name": "(new last name)",
            "profile_pic": (new profile image)
        }

            (모든 key-value는 optional)

    - Response example
        - {
            "id": 1,
            "email": "JohnDoe@gmail.com",
            "first_name": "John",
            "last_name": "Doe"
        }

    - HTTP status code
        - 200 OK

#### /space
- GET /space
    - Response Example
        - {
            "logo": "(logo image file name)",
            "id": 1,
            "name": "JohnDoe's space",
            "code_admin": "wlRD3E71",
            "code_member": "G23AnjyU"
        } 

    - HTTP status code
        - 200 OK

- POST /space/create
    - Request body example
        - {
            "name": "Jeff's space",
            "logo": (image file, optional)
        }

    - Response example
        - {
            "logo": "(logo image file name)",
            "name": "Jeff's space",
            "code_admin": "RYRRjz62",
            "code_member": "NtmFWvwL",
            "id": 1
        }

    - HTTP status code
        - 201 Created

- GET /space/:spaceId/handover/:newOwnerId
    - Parameter
        - spaceId: number
        - newOwnerId: number

    - Response example
        - {
            "id": 1,
            "logo": "(logo image file name)",
            "name": "Jeff's space",
            "owner": {
                "id": 1
            }
        }

    - HTTP status code
        - 200 OK

- POST /space/:spaceId/newRole
    - Parameter
        - spaceId: number

    - Request body example
        - {
            "newRoleName": "student",
            "is_admin": true (optional, default is false)
        }
    
    - Response example
        - {
            "is_admin": false,
            "name": "student",
            "space": {
                "id": 1,
                "name": "John's space"
            }
        }
    
    - HTTP status code
        - 201 Created

- PATCH /space/:spaceId/changeRole
    - Parameter
        - spaceId: number

    - Request body example
        - {
            "userId": 1,
            "newRoleName": "student"
        }
    
    - Response example
        - {
            "id": 1,
            "spacerole": {
                "is_admin": true,
                "id": 1,
                "name": "admin"
            }
        }

    - HTTP status code
        - 200 OK

- DELETE /space/:spaceId/deleteRole
    - Parameter
        - spaceId: number

    - Request body example
        - {
            "roleName": "student"
        }
    
    - Response example
        - {"message": "Deleted spaceRole (roleName) successfully"}

    - HTTP status code
        - 200 OK

- POST /space/:spaceId/post
    - Parameter
        - spaceId: number

    - Request body example
        - {
            "is_notice": false,
            "is_anonymous": false,
            "content": "Hello"
        }

    - Response example
        - {
            "is_notice": false,
            "is_anonymous": true,
            "content": "Hello",
            "writer": {
                "id": 1,
                "first_name": "John",
                "last_name": "Doe"
            }, (null if is_anonymous is true)
            "space": {
                "id": 2,
                "name": "Jeff's space"
            },
            "id": 1
        }
    
    - HTTP status code
        - 201 Created

- POST /space/enter
    - Request body example
        - {
            "code": "D3Udcx6q"
        }

    - Response example
        - {
            "user": {
                "id": 1,
                "email": "JohnDoe@gmail.com",
                "first_name": "John",
                "last_name": "Doe"
            },
            "space": {
                "id": 1,
                "name": "Jane's space"
            },
            "spacerole": {
                "is_admin": false,
                "id": 1,
                "name": "member"
            },
            "id": 1
        }

    - HTTP status code
        - 201 Created

- GET /space/:spaceId/posts
    - Parameter
        - spaceId: number

    - Response example
        - [
            {
                "is_notice": false,
                "is_anonymous": true,
                "id": 4,
                "content": "What is normalization in RDBMS?",
                "writer": null
            },
            {
                "is_notice": false,
                "is_anonymous": false,
                "id": 6,
                "content": "Hello",
                "writer": {
                    "id": 10,
                    "first_name": "John",
                    "last_name": "Doe"
                }
            }
        ]
        
    - HTTP status code
        - 200 OK

    
- GET /space/:spaceId/trending
    - Parameter
        - spaceId: number

    - Response example
        - [
            {
                "is_notice": false,
                "is_anonymous": true,
                "id": 1,
                "content": "post 1"
            },
            {
                "is_notice": false,
                "is_anonymous": false,
                "id": 2,
                "content": "post 2"
            },
            {
                "is_notice": false,
                "is_anonymous": false,
                "id": 3,
                "content": "post 3"
            },
            {
                "is_notice": false,
                "is_anonymous": false,
                "id": 4,
                "content": "post 4"
            },
            {
                "is_notice": false,
                "is_anonymous": false,
                "id": 5,
                "content": "post 5"
            }
        ]
    
    - HTTP status code
        - 200 OK

#### /post
- GET /post
    - Response example
        - [
            {
                "is_notice": false,
                "is_anonymous": false,
                "id": 1,
                "content": "hello"
            }
        ]
    
    - HTTP status code
        - 200 OK

- DELETE /:postId
    - Parameter
        - postId: number
    
    - Response example
        - {"message": "Deleted post successfully"}

    - HTTP status code
        - 200 OK

#### /chat
- GET /chat
    - Response example
        - [
            {
                "is_anonymous": false,
                "id": 1,
                "deletedAt": null,
                "content": "hi"
            }
        ]
    
    - HTTP status code
        - 200 OK

- DELETE /chat/:chatId
    - Parameter
        - chatId: number

    - Response body example
        - {"message": "Deleted chat successfully"}

    - HTTP status code
        - 200 OK

- POST /chat/:postId/:chatId?
    - Parameter
        - postId: number
        - chatId: number (optional)

    - Request body example
        - {
            "is_anonymous": false,
            "content": "welcome"
        }

    - Response example
        - {
            "is_anonymous": false,
            "content": "welcome",
            "post": {
                "is_notice": false,
                "is_anonymous": true,
                "id": 1,
                "content": "Hello",
                "space": {
                    "id": 1,
                    "logo": "(logo image file name)",
                    "name": "John's space"
                }
            },
            "id": 1,
            "deletedAt": null
        }

    - HTTP status code
        - 201 Created

## 추가할 기능
- 페이징
- 참여 중인 공간의 새 글 알림
- 작성한 게시글의 새 댓글 알림
- 작성한 댓글/답글의 새 댓글 알림

<!-- 관리자의 역할은 변경 불가 -->
<!-- config 사용하기 -->
<!-- jest로 테스트 하기 -->