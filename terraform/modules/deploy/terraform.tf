resource "aws_lambda_function" "backup" {
  function_name    = "lambda-api-gateway"
  filename         = "${path.module}/files/LambdaBackupEfsFunction.zip"
  source_code_hash = "${base64sha256(file("${path.module}/files/LambdaBackupEfsFunction.zip"))}"
  role             = "${var.lambda-role-arn}"
  handler          = "LambdaBackupEfsFunction.lambda_handler"
  runtime          = "python3.6"
  timeout          = 10

  environment {
    variables = {
    }
  }

  tags {
    creator = "${var.globalName}"
    Name = "lambda-test"
  }

  # depends_on = ["data.archive_file.backup"]
}
