const HTML_TEMPLATE = (text: any) => {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>Do not reply!</title>
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
          }
          .container {
            width: 100%;
            min-height: 100vh;
            padding: 40px 20px;
          }
          .email {
            max-width: 600px;
            margin: 0 auto;
            background-color: #f8f9fa;
            border-radius: 10px;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
            overflow: hidden;
          }
          .email-header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: #fff;
            padding: 25px 10px;
            text-align: center;
          }
          .email-header h1 {
            font-size: 28px;
            font-weight: 600;
            letter-spacing: 1px;
          }
          .email-body {
            padding: 40px 30px;
            font-size: 16px;
            color: #555;
          }
          .email-footer {
            background-color: #f8f9fa;
            color: #777;
            padding: 20px;
            text-align: center;
            font-size: 14px;
            border-top: 1px solid #e9ecef;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="email">
            <div class="email-header">
              <h1>Reset Your Password</h1>
            </div>
            <div class="email-body">
              <p>${text}</p>
            </div>
            <div class="email-footer">
              <p>This is an automated message. Please do not reply.</p>
            </div>
          </div>
        </div>
      </body>
    </html>
  `;
}

export default HTML_TEMPLATE;