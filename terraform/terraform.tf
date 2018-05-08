############################
########## MODE ############
############################
variable "Mode" { default = "test"}



############################
######## REQUIRED ##########
############################
# General
variable "GeneralName" {default = "Api-gateway"}
variable "GeneralNameSuffixTerraform" {}
variable "GeneralNameSuffixPacker" {}
variable "GeneralDiskSize" {}
variable "GeneralSms" {}
variable "GeneralDomainName"{}

# Application
#variable "ApplicationBackupPaths" { type = "list" }
variable "ApplicationBackupPaths" {  }
variable "ApplicationUser" { }

# AWS
variable "AWSAccountId" {}
variable "AWSMainUser" {}
variable "AWSRegion" {}
variable "AWSKeyName" {}
variable "AWSZoneId" {}
#variable "AWSDomainName" {}
variable "AWSAmazonAMI" {}
variable "AWSInstanceType" {}
variable "AWSAsgAmountMin" { default = "0" }
variable "AWSAsgAmountDesired" { default = "1" }
variable "AWSAsgAmountMax" { default = "2" }



############################
######## OPTIONAL ##########
############################



############################
######## PROVIDERS #########
############################
# Set providers
provider "template" {}
provider "archive" {}
provider "aws" {
  alias  = "AWS"
  region = "${var.AWSRegion}"
}

// Create the stack
module "AWS-init" {
  source = "./modules/deploy/"
  Global_name         = "${var.GeneralName}"
  region              = "${var.AWSRegion}"


  providers = {
    aws = "aws.AWS"
  }

  #depends_on = ["module.AWS-network.igw-id"] # Recommended here: https://www.terraform.io/docs/providers/aws/r/internet_gateway.html
}
