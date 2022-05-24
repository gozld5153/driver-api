import { MigrationInterface, QueryRunner } from "typeorm";

export class renameProfileToInvitation1653284100924 implements MigrationInterface {
    name = 'renameProfileToInvitation1653284100924'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`invitations\` (\`id\` int NOT NULL AUTO_INCREMENT, \`name\` varchar(255) NOT NULL, \`phoneNumber\` varchar(255) NOT NULL, \`address\` varchar(255) NULL, \`email\` varchar(255) NULL, \`licenseNumber\` varchar(255) NOT NULL, \`code\` varchar(255) NOT NULL, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deletedAt\` datetime(6) NULL, \`organizationId\` int NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`invitations\` ADD CONSTRAINT \`FK_b9139f00cebfadced76bca3084f\` FOREIGN KEY (\`organizationId\`) REFERENCES \`organizations\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`invitations\` DROP FOREIGN KEY \`FK_b9139f00cebfadced76bca3084f\``);
        await queryRunner.query(`DROP TABLE \`invitations\``);
    }

}
